import { SmartContract, TSmartContract } from "src/models/smart_contract.model";
import { urls } from ".";
import { baseApi } from "./axios_client";


export function getContract(type: TSmartContract | string, chainId: string): Promise<SmartContract | object>{
    return baseApi({
        url: urls.getContract(type, chainId),
        method: 'GET'
    })
}