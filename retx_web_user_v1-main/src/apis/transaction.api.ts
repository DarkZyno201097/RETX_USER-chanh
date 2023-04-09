import { baseApi } from "./axios_client";
import { Bank, BankAccount } from "src/models/bank_account.model";
import { FormTopupCreate, FormWithdrawCreate, IResponseTopupTransactions, IResponseWithdrawTransactions, TransactionTopup, TransactionWithdraw } from "src/models/transaction.model";
import { urls } from ".";

const ENDPOINT = process.env.ENDPOINT_TOPUP


export function banksList(){
    return baseApi<Bank[]>({
        endpoint: ENDPOINT,
        url: urls.banksList,
        method: "GET",
    })
}

export function bankAccountsList(){
    return baseApi<BankAccount[]>({
        endpoint: ENDPOINT,
        url: urls.bankAccountsList,
        method: 'GET'
    })
}

export function topupConfirm(data: FormTopupCreate){
    return baseApi<TransactionTopup>({
        endpoint: ENDPOINT,
        url: urls.topupConfirm(data.userId),
        method: 'POST',
        data: {
            ...data,
            amount: data.amount
        }
    })
}

export function topupTransactionInit(userId: string){
    return baseApi<TransactionTopup>({
        endpoint: ENDPOINT,
        url: urls.getTopupTransactionInit(userId),
        method: 'GET'
    })
}

export function finishedTopupTransaction(userId: string, transactionId: string, status: 'pending' | 'cancelled'){
    return baseApi<TransactionTopup>({
        endpoint: ENDPOINT,
        url: urls.finishedTopupTransaction(userId, transactionId),
        method: 'POST',
        data: {
            status,
        }
    })
}

export function createWithdrawTransaction(data:FormWithdrawCreate){
    return baseApi<TransactionWithdraw>({
        endpoint: ENDPOINT,
        url: urls.createWithdrawTransaction(data.userId),
        method:'POST',
        headers: {
            "otp-token-phone": data.otpTokenPhone
        },
        data: {
            ...data,
            amount:data.amount
        }
    })
}

export function getWithdrawTransactionPending(userId: string){
    return baseApi<TransactionWithdraw>({
        endpoint: ENDPOINT,
        url: urls.getWithdrawTransactionPending(userId),
        method: 'GET'
    })
}

export function getTopupTransactions(userId: string, params: {
    page: number,
    limit: number
}){
    return baseApi<IResponseTopupTransactions>({
        endpoint: ENDPOINT,
        url: urls.getTopupTransactions(userId),
        method: 'GET',
        params
    })
}

export function getWithdrawTransactions(userId: string, params: {
    page: number,
    limit: number
}){
    return baseApi<IResponseWithdrawTransactions>({
        endpoint: ENDPOINT,
        url: urls.getWithdrawTransactions(userId),
        params,
        method:'GET'
    })
}

export function cancelWithdrawTransaction(userId: string, transactionId: string){
    return baseApi<TransactionWithdraw>({
        endpoint: ENDPOINT,
        url: urls.cancelWithdrawTransaction(userId, transactionId),
        method:'POST',
        data: {
            status: 'cancelled'
        }
    })
}