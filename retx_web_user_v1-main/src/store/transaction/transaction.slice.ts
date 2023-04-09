import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@store/reducer'
import { Bank, BankAccount } from 'src/models/bank_account.model'
import { IErrorsValidateResponse } from 'src/models/response.model'
import { IResponseTopupTransactions, IResponseWithdrawTransactions, TransactionTopup, TransactionWithdraw } from 'src/models/transaction.model'

export interface TransactionState {
    banks: Bank[],
    loadingBanks: boolean,
    bankAccounts: BankAccount[],
    loadingBankAccounts: boolean,
    loadingTopupConfirm: boolean,
    transactionInitTopup: TransactionTopup ,
    errorsValidate: IErrorsValidateResponse,
    loadingTopupTransactionInit: boolean,
    loadingTransferedToptupTransaction: boolean,
    loadingCreateWithdrawTransaction: boolean,
    transactionWithdrawPending: TransactionWithdraw,
    loadingTransactionWithdrawPending: boolean,
    topupTransactions: IResponseTopupTransactions,
    loadingTopupTransactions: boolean,
    withdrawTransactions: IResponseWithdrawTransactions,
    loadingWithdrawTransactions: boolean,
    loadingCancelWithdrawTransaction: boolean,
}

export const initialState: TransactionState = {
    banks: [],
    loadingBanks: true,
    bankAccounts: [],
    loadingBankAccounts: true,
    loadingTopupConfirm: false,
    transactionInitTopup: null,
    errorsValidate: {},
    loadingTopupTransactionInit: false,
    loadingTransferedToptupTransaction: false,
    loadingCreateWithdrawTransaction: false,
    transactionWithdrawPending: null,
    loadingTransactionWithdrawPending: false,
    topupTransactions: {
        data: [],
        page: 0,
        totalPage: 0
    },
    loadingTopupTransactions: false,
    withdrawTransactions: {
        data: [],
        page: 0,
        totalPage: 0
    },
    loadingWithdrawTransactions: false,
    loadingCancelWithdrawTransaction: false,
}

export const transactionSlice = createSlice({
    name: 'transaction',
    initialState,
    reducers: {
        loadingBankList: (state)=>{
            state.loadingBanks = true
        },
        banksListSuccess: (state, {payload}: PayloadAction<Bank[]>) => {
            state.banks = payload.map(item => new Bank(item))
            state.loadingBanks = false
        },
        loadingBankAccounts: (state)=>{
            state.loadingBankAccounts = true
        },
        bankAccountsListSuccess: (state, {payload}: PayloadAction<BankAccount[]>) => {
            state.bankAccounts = payload.map(item => new BankAccount(item))
            state.loadingBankAccounts = false
        },
        loadingTopupConfirm: (state)=>{
            state.loadingTopupConfirm = true
        },
        topupConfirmSuccess: (state, {payload}: PayloadAction<TransactionTopup>)=>{
            state.loadingTopupConfirm = false
            state.transactionInitTopup = new TransactionTopup(payload)
            state.errorsValidate = {}
        },
        topupConfirmFail: (state, {payload}: PayloadAction<IErrorsValidateResponse>) => {
            state.loadingTopupConfirm = false
            state.errorsValidate = payload
        },
        loadingGetTopupTransactionInit: (state)=>{
            state.loadingTopupTransactionInit = true;
        },
        getTopupTransactionInitSuccess: (state, {payload}: PayloadAction<TransactionTopup>)=>{
            state.loadingTopupTransactionInit = false;
            state.transactionInitTopup = new TransactionTopup(payload)
        },
        getTopupTransactionInitFail: (state, {payload}: PayloadAction<IErrorsValidateResponse>)=>{
            state.loadingTopupTransactionInit = false;
            state.transactionInitTopup = null
        },
        loadingTransferedToptupTransaction: (state)=>{
            state.loadingTransferedToptupTransaction = true;
        },
        transferedToptupTransactionSuccess: (state, {payload}: PayloadAction<TransactionTopup>)=>{
            state.loadingTransferedToptupTransaction = false
            state.transactionInitTopup = null
        },
        transferedTopupTransactionFail: (state)=>{
            state.loadingTransferedToptupTransaction = false
        },
        refreshFieldError: (state, {payload}: PayloadAction<string>)=>{
            let temp = {...state.errorsValidate}
            delete temp[payload]
            state.errorsValidate = temp
        },
        loadingCreateWithdrawTransaction:(state)=>{
            state.loadingCreateWithdrawTransaction = true
        },
        cteateWithdrawTransactionSuccess: (state, {payload}:PayloadAction<TransactionWithdraw>)=>{
            state.loadingCreateWithdrawTransaction = false
            state.transactionWithdrawPending = new TransactionWithdraw(payload)
        },
        cteateWithdrawTransactionFail: (state, {payload}: PayloadAction<IErrorsValidateResponse>)=>{
            state.loadingCreateWithdrawTransaction = false
            state.errorsValidate = payload
        },
        clearErrorsValidate: (state)=>{
            state.errorsValidate = {}
        },
        loadingTransactionWithdrawPending: (state)=>{
            state.loadingTransactionWithdrawPending = true
        },
        getTransactionWithdrawPendingSuccess: (state, {payload}:PayloadAction<TransactionWithdraw> )=>{
            state.loadingTransactionWithdrawPending = false
            state.transactionWithdrawPending = new TransactionWithdraw(payload)
        },
        getTransactionWithdrawPendingFail: (state)=>{
            state.loadingTransactionWithdrawPending = false
        },
        loadingTopupTransactions: (state)=>{
            state.loadingTopupTransactions = true
        },
        getTopupTransactionsSuccess: (state, {payload}: PayloadAction<IResponseTopupTransactions>)=>{
            state.loadingTopupTransactions = false
            state.topupTransactions = payload
        },
        getTopupTransactionsFail: (state)=>{
            state.loadingTopupTransactions = false
        },
        loadingWithdrawTransactions:(state)=>{
            state.loadingWithdrawTransactions = true
        },
        getWithdrawTransactionsSuccess: (state, {payload}: PayloadAction<IResponseWithdrawTransactions>)=>{
            state.loadingWithdrawTransactions = false;
            state.withdrawTransactions = payload
        },
        getWithdrawTransactionsFail: (state)=>{
            state.loadingWithdrawTransactions = false
        },
        loadingCancelWithdrawTransaction: (state)=>{
            state.loadingCancelWithdrawTransaction = true;
        },
        cancelWithdrawTransactionSuccess: (state)=>{
            state.loadingCancelWithdrawTransaction = false
            state.transactionWithdrawPending = null
        },
        cancelWithdrawTransactionFail: (state)=>{
            state.loadingCancelWithdrawTransaction = false
        }
    },
})

export const sliceActions = transactionSlice.actions
export const transactionReducer = transactionSlice.reducer
export const transactionSelector = (state: RootState) => state.transaction