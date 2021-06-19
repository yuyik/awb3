class claims{
    async getNFT(account, eos_rpc, aa_api) {
        const nft_res = await eos_rpc.get_table_rows({
            code: mining_account, 
            scope: mining_account, 
            table: 'claims', 
            limit: 100,
            lower_bound: account, 
            upper_bound: account
        });
        const nft = [];
        if (nft_res.rows.length){
            const items_p = nft_res.rows[0].template_ids.map((template_id) => {
                return aa_api.getTemplate("alien.worlds",template_id)
            });
            return await Promise.all(items_p);
        }
        return nft;
    }

    async stake(account, amount) {
        try {
            console.log(`Staking ${amount} WAX to CPU...`);
            const stake = {
                'from': account,
                'receiver': account,
                'stake_net_quantity': `0.00000000 WAX`,
                'stake_cpu_quantity': `${parseFloat(amount).toFixed(8)} WAX`,
                'transfer': false
            };
            const actions = [{
                'account': 'eosio',
                'name': 'delegatebw',
                'authorization': [{
                    'actor': account,
                    'permission': 'active'
                }],
                'data': stake
            }];
            let result = await wax.api.transact({
                actions,
            }, {
                blocksBehind: 3,
                expireSeconds: 90,
            });
            if (result && result.processed) {
                return `Complete stake ${amount} WAX `
            }
            return 0;
        } catch (error) {
            throw error;
        }
    }

    async swap(amount_sell = "0.0001 TLM",amount_get = "0.00000000" ) {
        try {
            let actions = []
            actions.push({
                account: 'alien.worlds',
                name: 'transfer',
                authorization: [{
                actor: wax.userAccount,
                permission: 'active',
                }],
                data: {
                    from: wax.userAccount,
                    to:"alcordexmain",
                    // quantity:`${amount_sell.toFixed(4)} TLM`,
                    quantity:amount_sell,  
                    memo:`${parseFloat(amount_get).toFixed(8)} WAX@eosio.token`   
                },
            });
        console.log('actions',actions)
            const result = await wax.api.transact({actions},{blocksBehind: 3,expireSeconds: 1200});
            return result
        } catch (err) {
            return {processed : false, message : 'Swap Error : ' + err.message}
        }
    }
}