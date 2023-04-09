

export class P2PTransaction {
    _id?: string;
    timestamp: number
    blockNumber: number
    method: string
    from: string
    to: string
    amount: number
    status: boolean
    transactionHash: string

    constructor()
    constructor(obj?: P2PTransaction)
    constructor(obj?: any){
        this.timestamp = obj?.timestamp || null
        this.blockNumber = obj?.blockNumber || null
        this.method = obj?.method || null
        this.from = obj?.from ? obj?.from.toLowerCase() : null
        this.to = obj?.to ? obj?.to.toLowerCase() : null
        this.amount = parseInt(obj?.amount || 0)
        this.status = obj?.status || false;
        this.transactionHash = obj?.transactionHash || null
    }
}