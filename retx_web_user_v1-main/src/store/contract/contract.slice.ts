import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@store/reducer'
import { isAddress } from '@utils/functions';
import { SmartContract } from 'src/models/smart_contract.model';
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract';

export interface ContractState {
    web3: Web3 | null,
    myAddress: String,
    infoContract:{
        accountManagement: SmartContract,
        asset: SmartContract,
        stableCoin: SmartContract,
        pancakeRouter: SmartContract,
        pancakeFactory: SmartContract,
        collection: SmartContract,
        nftManagement: SmartContract,
        nftExchange: SmartContract,
        risingPoolManagement: SmartContract,
        risingPool: SmartContract,
        systemWallet: SmartContract,
    },
    web3Contract: {
        accountManagement: Contract,
        asset: Contract,
        stableCoin: Contract,
        pancakeRouter: Contract,
        pancakeFactory: Contract,
        collection: Contract,
        nftManagement: Contract,
        nftExchange: Contract,
        risingPoolManagement: Contract,
        risingPool: Contract,
        systemWallet: Contract
    },
    loadedInfoContracts: boolean,
    loadingBalance: boolean,
    balance: number,
    decimals: number,
}

export const initialState: ContractState = {
    web3: null,
    myAddress: null,
    infoContract:{
        accountManagement: new SmartContract(),
        asset: new SmartContract(),
        stableCoin: new SmartContract(),
        pancakeRouter: new SmartContract(),
        pancakeFactory: new SmartContract(),
        collection: new SmartContract(),
        nftManagement: new SmartContract(),
        nftExchange: new SmartContract(),
        risingPoolManagement: new SmartContract(),
        risingPool: new SmartContract(),
        systemWallet: new SmartContract(),
    },
    web3Contract: {
        accountManagement: null,
        asset: null,
        stableCoin: null,
        pancakeRouter: null,
        pancakeFactory: null,
        collection: null,
        nftManagement: null,
        nftExchange: null,
        risingPoolManagement:null,
        risingPool: null,
        systemWallet: null
    },
    loadedInfoContracts: false,
    loadingBalance: false,
    balance: 0,
    decimals: 0,
}

export const contractSlice = createSlice({
  name: "contract",
  initialState,
  reducers: {
    setupWeb3Contract: (
      state,
      {
        payload,
      }: PayloadAction<{
        web3: Web3;
      }>
    ) => {
      try {
        state.web3 = payload.web3;
        let keys = Object.keys(state.infoContract);
        keys.forEach((key) => {
          if (
            isAddress(state.infoContract[key].address) &&
            state.infoContract[key].abi
          ) {
            state.web3Contract[key] = new payload.web3.eth.Contract(
              JSON.parse(state.infoContract[key].abi),
              state.infoContract[key].address
            ) as any;
          } else {
            state.web3Contract[key] = null;
          }
        });
        console.log("Setup contracts successfully!");
      } catch (e) {
        console.log("Setup contracts fail!");
        console.log(e);
      }
    },

    getInfoContractsSuccess: (
      state,
      {
        payload,
      }: PayloadAction<{
        accountManagement: SmartContract;
        stableCoin: SmartContract;
        asset: SmartContract;
        pancakeRouter: SmartContract;
        pancakeFactory: SmartContract;
        collection: SmartContract;
        nftManagement: SmartContract;
        nftExchange: SmartContract;
        risingPoolManagement: SmartContract;
        risingPool: SmartContract;
        systemWallet: SmartContract;
      }>
    ) => {
      let keys = Object.keys(payload);
      keys.forEach((key) => {
        if (!!payload[key]?.abi) state.infoContract[key] = payload[key];
      });
      state.loadedInfoContracts = true;
    },

    getInfoContractsFail: (state) => {
      state.loadedInfoContracts = false;
    },

    loadingBalance: (state) => {
      state.loadingBalance = true;
    },
    loadBalanceSuccess: (
      state,
      {
        payload,
      }: PayloadAction<{
        decimals: number;
        balance: number;
      }>
    ) => {
      state.loadingBalance = false;
      state.decimals = payload.decimals;
      state.balance = parseInt(payload.balance as any);
    },
    loadBalanceFail: (state) => {
      state.loadingBalance = false;
    },
  },
});

export const sliceActions = contractSlice.actions
export const contractReducer = contractSlice.reducer
export const contractSelector = (state: RootState) => state.contract