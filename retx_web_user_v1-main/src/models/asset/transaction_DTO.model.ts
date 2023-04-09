// import { timeToHuman } from "@utils/functions";

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

export class TransactionSwap{
    amountAsset: string;
    amountCurrency: string;
    timestamp: string;
    type: 'buy' | 'sell';
    from: string
    to: string
    blockNumber: string
    method: string;

    constructor()
    constructor(obj?: TransactionSwap)
    constructor(obj?: any){
        this.amountAsset = obj?.amountA || '';
        this.amountCurrency = obj?.amountB || '';
        this.timestamp = obj?.timestamp || '';
        this.type = obj?.type || null
        this.from = obj?.from || ''
        this.to = obj?.to || ''
        this.blockNumber = obj?.blockNumber || null
        this.method = obj?.method || ''
    }
}