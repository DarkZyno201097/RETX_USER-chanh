import { TAssetType } from "./asset/real_estate.model";

export const LIST_TYPE_SMART_CONTRACT = ['account_management', 'stable_coin', 'pancake_router', 'pancake_factory', 'nft', 'asset_management', 'asset', 'collection_management', 'collection', 'nft_exchange','rising_pool_management', 'rising_pool', 'system_wallet'] as const
export type TSmartContract = typeof LIST_TYPE_SMART_CONTRACT[number]

export class SmartContract {
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
    type: TSmartContract;
    address: string;
    abi: string;
    rpc_url: string;
    chain_id: string;
    symbol: string;
    name: string;
    file_name: string;
    init_code_hash?: string;

    constructor();
    constructor(obj: SmartContract);
    constructor(obj?: any) {
        this._id = obj?._id || ''
        this.createdAt = obj?.createdAt || ''
        this.updatedAt = obj?.updatedAt || ''
        this.file_name = obj?.file_name || ''
        this.type = obj?.type || null;
        this.address = obj?.address || ''
        this.abi = obj?.abi || '{}'
        this.rpc_url = obj?.rpc_url || ''
        this.chain_id = obj?.chain_id || ''
        this.symbol = obj?.symbol || ''
        this.name = obj?.name || ''
        this.init_code_hash = obj?.init_code_hash || ''
    }
}



export class TransactionDTO {
    timestamp: string;
    from: string;
    to: string;
    value: string;
    amount: string;
    method: string;
    fee: string;
    isError: string
    addressTo: string

    constructor()
    constructor(obj?: TransactionDTO)
    constructor(obj?: any) {
        this.timestamp = obj?.timestamp || '';
        this.from = obj?.from || '';
        this.to = obj?.to || '';
        this.value = obj?.value || '';
        this.amount = obj?.amount || '';
        this.method = obj?.method || '';
        this.fee = obj?.fee || '';
        this.isError = obj?.isError || ''
        this.addressTo = obj?.addressTo || ''
    }
}


export class AssetTransaction {
    timestamp: number
    blockNumber: number
    method: string
    from: string
    to: string
    price: number
    fee: number
    nftId: number
    amount: number
    assetType: TAssetType
    assetAddress: string
    status: boolean
    transactionHash: string

    constructor()
    constructor(obj?: AssetTransaction)
    constructor(obj?: any){
        this.timestamp = obj?.timestamp || null
        this.blockNumber = obj?.blockNumber || null
        this.method = obj?.method || null
        this.from = obj?.from ? obj?.from.toLowerCase() : null
        this.to = obj?.to ? obj?.to.toLowerCase() : null
        this.price = parseInt(obj?.price || 0)
        this.fee = parseInt(obj?.fee || 0)
        this.nftId = parseInt(obj?.nftId || 0)
        this.amount = parseInt(obj?.amount || 0)
        this.assetType = obj?.assetType || null
        this.assetAddress = obj?.assetAddress ? obj?.assetAddress.toLowerCase() : null
        this.status = obj?.status || false
        this.transactionHash = obj?.transactionHash || null
    }
}