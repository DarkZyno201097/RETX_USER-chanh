import { TransactionSwap } from "src/models/asset/transaction_DTO.model";
import { Comments, CommentsQA, CommentsUser } from "src/models/comment.model";
import { baseApi } from "./axios_client";
import { urls } from ".";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import { IPaginateData } from "src/models/paginate-data.interface";
import { Organization } from "src/models/organization.model";
import { FormRealEstateAsset } from "src/models/asset/form-real-estate.model";
import { IFilterAssetOption } from "src/models/asset/filter_options";
import { TransactionContract } from "src/models/transaction.model";
import axios from "axios";
import { AssetTransaction } from "src/models/smart_contract.model";

export function getAssets(params: {
    limit: number,
    page: number,
    filterObj?: IFilterAssetOption,
    search?: string,
}): Promise<IPaginateData<RealEstateAssetView>>{
    return baseApi({
        url: urls.getAssets,
        method: 'GET',
        params
    })
}

export function getAsset(id: string, params?: any): Promise<RealEstateAssetView> {
    return baseApi({
        url: urls.getAsset(id),
        method: 'GET',
        params
    })
}

export function getTransaction(id: string){
    return baseApi({
        url: urls.assetTransactions(id),
        method: 'GET'
    })
}

export function commentProduct(data: {
    assetId: string,
    content: string,
    ratting: string
}){
    return baseApi<{message: string, comment: CommentsUser}>({
        url: urls.commentProduct,
        method: 'POST',
        data
    })
}

export function getCommentsBy(id: string){
    return baseApi<CommentsUser[]>({
        url: urls.commentsByProduct(id),
        method: 'GET'
    })
}

export function getRealEstateInfo(){
    return baseApi({
        url: urls.getRealEstateInfo,
        method: 'GET'
    })
}


export function commentsQA__create(data: CommentsQA){
    return baseApi({
        url: urls.commentQA__create,
        method: 'POST',
        data
    })
}

export function commentsQA__list(id: string){
    return baseApi<CommentsUser[]>({
        url: urls.commentQA__list(id),
        method: 'GET',
    })
}

export function commentsQA__update(data: {
    id: string,
    content: string
}){
    return baseApi({
        url: urls.commentQA__update,
        method: "PUT",
        data
    })
}

export function decodeInputBlock(input: string) {
    return baseApi({
        url: urls.decodeInputBlock,
        method: 'POST',
        data: {
            input
        }
    })
}

export function decodeInputBlockV2(input: string) {
    return baseApi({
        url: urls.decodeInputBlockV2,
        method: 'POST',
        data: {
            input
        }
    })
}


export function getTransactionsByToken(data: {
    address: string;
    network: 'testnet' | 'mainnet';
}){
    return baseApi<TransactionSwap[]>({
        url: urls.getTransactionByToken(data.address, data.network),
        method: 'GET',
    })
}

export function getSellers(): Promise<Organization[]>{
    return baseApi({
        url: urls.getSellers,
        method: 'GET',
    })
}

export function listFormRealEstateAsset(): Promise<FormRealEstateAsset[]>{
    return baseApi({
        url: urls.listFormRealEstateAsset,
        method: 'GET',
    })
}

export function getAllTransactionsContract(){
    return baseApi<TransactionContract[]>({
        url: urls.getAllTransactionsContract,
        method: 'GET',
    })
}

export function asyncTransactionsContract(data: TransactionContract[]){
    return baseApi<TransactionContract[]>({
        url: urls.asyncTransactionsContract,
        method: 'POST',
        data:{
            data
        }
    })
}

export function addTransactionsContract(data: TransactionContract[]){
    return baseApi<TransactionContract[]>({
        url: urls.addTransactionsContract,
        method: 'POST',
        data:{
            data
        }
    })
}

export function cacheDataAsset(params: {
    assetId: string,
    fieldname: string,
    data: any,
    assetAddress?: string
}){
    return baseApi({
        url: urls.cacheDataAsset(params.assetId, params.fieldname),
        method: 'PUT',
        data: {
            data: params.data,
            assetAddress: params?.assetAddress || null
        }
    })
}

export function pinataURI(cid: string){
    return axios.get(`https://${process.env.GATEWAY_PINATA}/ipfs/${cid}`)
}

export function getAssetBlockTransactions(assetAddress: string) {
    return baseApi<number>({
        url: urls.getAssetBlockTransactions(assetAddress),
        method:'GET',
    })
}

export function getAssetTransactions(assetAddress: string) {
    return baseApi<AssetTransaction[]>({
        url: urls.getAssetTransactions(assetAddress),
        method:'GET',
    })
}

export function updateAssetTransactions(assetAddress: string, data: AssetTransaction[]) {
    return baseApi<number>({
        url: urls.getAssetTransactions(assetAddress),
        method:'PUT',
        data
    })
}

export function addAssetBlockTransaction(params: {
    assetAddress: string,
    fromBlock: number
}){
    return baseApi({
        url: urls.addAssetBlockTransaction(params.assetAddress),
        method: 'POST',
        data:{
            fromBlock: params.fromBlock
        }
    })
}