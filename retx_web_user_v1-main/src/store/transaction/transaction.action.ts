import { AppThunk, dispatch } from '@store/index'
import { sliceActions } from '@store/transaction/transaction.slice'
import { transactionApi } from '@apis/index'
import { FormTopupCreate, FormWithdrawCreate } from 'src/models/transaction.model'
import { alertActions } from '../actions'


export const banksList = (): AppThunk => async (dispatch) => {
    try{
        dispatch(sliceActions.loadingBankList())
        let response = await transactionApi.banksList()
        dispatch(sliceActions.banksListSuccess(response))
    }
    catch(err) {
        console.log(err)
    }
}

export const bankAccountsList = (): AppThunk => async (dispatch) => {
    try{
        dispatch(sliceActions.loadingBankAccounts())
        let response = await transactionApi.bankAccountsList()
        dispatch(sliceActions.bankAccountsListSuccess(response))
    }
    catch(err) {
        console.log(err)
    }
}

export const topupConfirm = (data: FormTopupCreate): AppThunk => async (dispatch) => {
    try{
        dispatch(sliceActions.loadingTopupConfirm())
        let response = await transactionApi.topupConfirm(data)
        dispatch(sliceActions.topupConfirmSuccess(response))
    }
    catch(err){
        console.log(err)
        dispatch(sliceActions.topupConfirmFail(err?.errors || {}))
    }
}

export const getTopupTransactionInit = (userId: string): AppThunk => async (dispatch) => {
    try{
        dispatch(sliceActions.loadingGetTopupTransactionInit())
        let response = await transactionApi.topupTransactionInit(userId)
        dispatch(sliceActions.getTopupTransactionInitSuccess(response))
    }
    catch(err){
        console.log(err)
        dispatch(sliceActions.getTopupTransactionInitFail())
    }
}

export const transferedToptupTransaction = (status: 'pending' | 'cancelled', onSuccess: ()=>void):AppThunk => async (dispatch, getState) => {
    try{
        dispatch(sliceActions.loadingTransferedToptupTransaction())
        let userId = getState().auth.user?.id
        let transactionId = getState().transaction.transactionInitTopup.id
        let response = await transactionApi.finishedTopupTransaction(userId, transactionId, status)
        dispatch(sliceActions.transferedToptupTransactionSuccess(response))
        onSuccess()
    }
    catch(err){
        console.log(err)
        dispatch(sliceActions.transferedTopupTransactionFail())
    }

}

export const createWithdrawTransaction = (data: FormWithdrawCreate, onSuccess: ()=>void): AppThunk => async (dispatch) => {
    try{
        dispatch(sliceActions.loadingCreateWithdrawTransaction())
        let response = await transactionApi.createWithdrawTransaction(data)
        dispatch(sliceActions.cteateWithdrawTransactionSuccess(response))
       
        dispatch(sliceActions.clearErrorsValidate())
        onSuccess()
    }
    catch(err){
        console.log(err)
        dispatch(sliceActions.cteateWithdrawTransactionFail(err?.errors || {}))
    }
}

export const getTransactionWithdrawPending = (userId: string):AppThunk => async(dispatch)=>{
    try{
        dispatch(sliceActions.loadingTransactionWithdrawPending())
        let response = await transactionApi.getWithdrawTransactionPending(userId)
        dispatch(sliceActions.getTransactionWithdrawPendingSuccess(response))
    }
    catch(err){
        console.log(err)
        dispatch(sliceActions.getTransactionWithdrawPendingFail())
    }
}

export const getTopupTransactions = (userId: string, params: {
    page: number,
    limit: number
}):AppThunk => async(dispatch)=>{
    try{
        dispatch(sliceActions.loadingTopupTransactions())
        let response = await transactionApi.getTopupTransactions(userId, params)
        dispatch(sliceActions.getTopupTransactionsSuccess(response))
    }
    catch(err){
        console.log(err)
        dispatch(sliceActions.getTopupTransactionsFail())
    }
}

export const getWithdrawTransactions = (userId: string, params:{
    page: number,
    limit: number
}):AppThunk => async(dispatch)=>{
    try{
        dispatch(sliceActions.loadingWithdrawTransactions())
        let response = await transactionApi.getWithdrawTransactions(userId, params)
        dispatch(sliceActions.getWithdrawTransactionsSuccess(response))
    }
    catch(err){
        console.log(err)
        dispatch(sliceActions.getWithdrawTransactionsFail())
    }
}

export const cancelWithdrawTransaction = (userId: string, transactionId: string): AppThunk => async (dispatch) => {
    try{    
        dispatch(sliceActions.loadingCancelWithdrawTransaction())
        let response = await transactionApi.cancelWithdrawTransaction(userId, transactionId)
        dispatch(sliceActions.cancelWithdrawTransactionSuccess())
    }
    catch(err){
        console.log(err)
        err?.message && dispatch(alertActions.alertError(err?.message))
        dispatch(sliceActions.cancelWithdrawTransactionFail())
    }
}

export const refreshFieldError = sliceActions.refreshFieldError
export const clearErrorsValidate = sliceActions.clearErrorsValidate