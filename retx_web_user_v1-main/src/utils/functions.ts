import axios from "axios";

import { assetApi } from "@apis/index";
import { TransactionSwap } from "src/models/asset/transaction_DTO.model";
import { TransactionDTO } from "src/models/smart_contract.model";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import { divValueBlock } from "./number";
import { TransactionContract } from "src/models/transaction.model";
import _ from "lodash";

export const timeToHuman = (epoch: any) => {

    if (!isNaN(epoch)) {
        epoch = parseInt(epoch)
    }
    let d = new Date(epoch);

    let ddmmyyyy = d.getDate().toString() + "/" + (d.getMonth() + 1).toString() + "/" + d.getFullYear().toString();

    return {
        ddmmyyyy,
        date: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        toLocaleVnString: d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    }
}

const handleTransactionTxData = async (trans: any, contractRouterABI: string): Promise<TransactionContract> => new Promise(async (resolve, reject) => {
    try {
        const resDecodeData: any = await axios({
            url: '/api/decode-input',
            method: 'POST',
            data: {
                abi: contractRouterABI,
                input: trans?.input || ''
            }
        })
        const decodedData = resDecodeData.data

        let t = new TransactionContract()
        t.timestamp = trans?.timeStamp;
        let path = decodedData?.params?.[2]?.value;
        if (decodedData?.name == 'swapTokensForExactTokens' || decodedData?.name == 'swapExactTokensForTokens') {
            t.amountAsset = parseFloat(decodedData.params[0].value);
            t.amountCurrency = parseFloat(decodedData.params[1].value);
            t.from = trans?.from
            t.to = trans?.to
            t.path = path
            t.blockNumber = parseFloat(trans?.blockNumber)
            t.method = decodedData?.name
            t.isError = trans?.isError
            resolve(t)
        }

        else return resolve(null)
    }
    catch (err) {
        reject(err)
    }
})

const handleAssetTxData = async (trans: any, assetABI: string): Promise<TransactionContract> => {
    return new Promise(async (resolve, reject) => {
        try {
            const resDecodeData: any = await axios({
                url: '/api/decode-input',
                method: 'POST',
                data: {
                    abi: assetABI,
                    input: trans?.input || ''
                }
            })
            const decodedData = resDecodeData.data

            let t = new TransactionContract()
            t.timestamp = trans?.timeStamp;
            if (decodedData?.name == 'transfer') {
                t.from = trans?.from
                t.to = decodedData.params[0].value
                t.amount = decodedData.params[1].value
                t.blockNumber = parseFloat(trans?.blockNumber)
                t.method = decodedData?.name
                t.isError = trans?.isError
                t.assetAddress = trans?.to
                resolve(t)
            }
            else resolve(null)
        }
        catch (error) {
            reject(error)
        }
    })
}



export const getTransactionsStableCoin = async (data: {
    stableCoinABI: string
    stableCoinDecimals: number
    apiTxlist: string
}) => {

    let {
        stableCoinABI,
        stableCoinDecimals,
        apiTxlist,
    } = data


    let response = {
        data: {
            status: '-1',
            result: [],
        }
    }

    response = await axios({
        url: apiTxlist,
        method: 'GET'
    })

    if (response?.data?.status == '1') {
        let transactions: TransactionDTO[] = await Promise.all(response.data.result.map(async (trans: any) => {
            let t = new TransactionDTO(trans)
            const resDecode = await axios({
                url: '/api/decode-input',
                method: 'POST',
                data: {
                    input: trans.input,
                    abi: stableCoinABI,
                }
            })

            const decodedData = resDecode.data
            let amount = '';
            let address = '';
            let method = decodedData?.name;

            decodedData?.params?.forEach((item: any) => {
                if (item.name == 'amount') amount = item.value;
                else if (item.name == 'recipient') address = item.value;
                if (item.name == 'sender') t.from = item.value;
            });


            t.amount = divValueBlock(amount.toString(), stableCoinDecimals)
            t.method = method
            t.addressTo = address
            t.timestamp = trans?.timeStamp
            t.fee = (trans.gasUsed * trans.gasPrice * Math.pow(10, -9) * Math.pow(10, -9)).toString()
            return t
        }))
        return transactions.filter(item => item.method == "transfer" || item.method == "transferFrom")

    }
    else {
        return []
    }
}

export function isEmail(input: string) {

    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (input.match(validRegex)) {
        return true;
    } else {
        return false;
    }

}

interface IItemLocalStorage {
    key: string;
    value: string;
}
export function findLocalItems(query: any): IItemLocalStorage[] {
    var i, results = [];
    for (i in localStorage) {
        if (localStorage.hasOwnProperty(i)) {
            if (i.match(query) || (!query && typeof i === 'string')) {
                let value = JSON.parse(localStorage.getItem(i));
                results.push({ key: i, value });
            }
        }
    }
    return results;
}

export function isAddress(address: string) {
    if (address.slice(0, 2) != '0x' || address.length != 42) return false
    else return true
}

export function convertUrl(uri: string) {
    return uri?.includes('ipfs://') ? `https://${process.env.GATEWAY_PINATA}/ipfs/${uri?.split('ipfs://')[1]}` : uri
}

export function parseErrorWeb3(message: string){
   try{
    return JSON.parse( message.slice(message.indexOf('{'), message.indexOf('}')+1))
   }
   catch(e){
    console.log('parseErrorWeb3, err: ', e)
    return {}
   }
}