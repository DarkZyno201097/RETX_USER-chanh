import { AppThunk, dispatch } from "@store/index";
import { sliceActions } from "@store/contract/contract.slice";
import { contractApi } from "@apis/index";
import { SmartContract, TSmartContract } from "src/models/smart_contract.model";

export const loadContracts =
  (chainId: string): AppThunk =>
  async (dispatch, getState) => {
    try {
      let loadedContracts = getState().contract.infoContract;
      let objs: { key: TSmartContract; var: string }[] = [
        {
          key: "account_management",
          var: "accountManagement",
        },
        {
          key: "stable_coin",
          var: "stableCoin",
        },
        {
          key: "asset",
          var: "asset",
        },
        {
          key: "pancake_router",
          var: "pancakeRouter",
        },
        {
          key: "pancake_factory",
          var: "pancakeFactory",
        },
        {
          key: "collection",
          var: "collection",
        },
        {
          key: "nft",
          var: "nftManagement",
        },
        {
          key: "nft_exchange",
          var: "nftExchange",
        },
        {
          key: "rising_pool_management",
          var: "risingPoolManagement",
        },
        {
          key: "rising_pool",
          var: "risingPool",
        },
        {
          key: "system_wallet",
          var: "systemWallet",
        },
      ];

      let contracts: any = {};
      let contractsNeedLoad = objs.filter((item) => {
        if (
          chainId == loadedContracts[item.var]?.chain_id &&
          !!loadedContracts[item.var]?.abi
        )
          return false;
        else return true;
      });
      
      let resContracts = await contractApi.getContract(
        JSON.stringify(
          contractsNeedLoad.map((item) => {
            return item.key;
          })
        ),
        chainId
      );

      contractsNeedLoad.forEach((item) => {
        contracts[item.var] = resContracts[item.key];
      });

      dispatch(sliceActions.getInfoContractsSuccess(contracts));
    } catch (e) {
      console.log(e);
    }
  };

export const loadBalance =
  (address: string): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(sliceActions.loadingBalance());
      let contract = getState().contract.web3Contract.stableCoin;
      // let decimals = await contract.methods.decimals().call()
      let decimals = 0;
      let balance = await contract.methods.balanceOf(address).call();
      
      dispatch(
        sliceActions.loadBalanceSuccess({
          decimals,
          balance,
        })
      );
    } catch (e) {
      console.log(e);
      dispatch(sliceActions.loadBalanceFail());
    }
  };

export const self = sliceActions;
