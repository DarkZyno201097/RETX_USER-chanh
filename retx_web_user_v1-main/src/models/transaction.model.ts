import { BankAccount } from "./bank_account.model"
import { TKycStatus } from "./user/user.model"

export class FormTopupCreate {
    amount: number
    bankId: string
    timestamp: number
    userId: string
    constructor()
    constructor(obj?: FormTopupCreate) 
    constructor(obj?: any) {
        this.amount = obj?.amount || 0
        this.bankId = obj?.bankId || ''
        this.timestamp = obj?.timestamp || 0
        this.userId = obj?.userId || ''
    }
}


export class FormWithdrawCreate {
    amount: number
    receiveBank: string
    receiveBankAccountNumber: number
    receiveBankAccountHolder: string
    userId: string
    otpTokenPhone: string
    constructor()
    constructor(obj?: FormWithdrawCreate) 
    constructor(obj?: any) {
        this.amount = obj?.amount || 0
        this.receiveBank = obj?.bankId || ''
        this.receiveBankAccountNumber = obj?.receiveBankAccountNumber || ''
        this.receiveBankAccountHolder = obj?.receiveBankAccountHolder || ''
        this.userId = obj?.userId || ''
        this.otpTokenPhone = obj?.otpTokenPhone || ''
    }
}


export type TTransactionTopupStatus = 'cancelled' | 'pending' | 'initialize' | 'failed' | 'success' | 'refund' | 'expired'

export type TTransactionWithdrawStatus = 'cancelled'| 'pending'| 'half-done'| 'done'

export class TransactionUser{
    id: string;
    name: string;
    email: string;
    role: string;
    access_token: string;
    addressWallet: string
    kycStatus: TKycStatus;
    activeTransaction: boolean
    phoneNumber: string

    constructor()
    constructor(obj?: TransactionUser)
    constructor(obj?: any){
        this.id = obj?.id || "";
        this.name = obj?.name || "";
        this.email = obj?.email || "";
        this.role = obj?.role || "";
        this.access_token = obj?.access_token || "";
        this.addressWallet = obj?.addressWallet || "";
        this.kycStatus = obj?.kycStatus || 'not_yet'
        this.activeTransaction = obj?.activeTransaction || false
        this.phoneNumber = obj?.phoneNumber || ''
    }
}

export class TransactionTopup {
    id: string;
    bankAccount: BankAccount
    user: TransactionUser
    amount: number
    timestamp: number
    status: TTransactionTopupStatus
    content: string
    feedback: string
    createdAt: string
    updatedAt: string
    expiredAt: string
    constructor()
    constructor(obj?: TransactionTopup) 
    constructor(obj?: any) {
        this.amount = obj?.amount || 0
        this.bankAccount = new BankAccount(obj?.bankAccount || {})
        this.content = obj?.content || ''
        this.createdAt = obj?.createdAt || ''
        this.feedback = obj?.feedback || ''
        this.id = obj?.id || ''
        this.status = obj?.status || 'initialize'
        this.timestamp = obj?.timestamp || 0
        this.updatedAt = obj?.updatedAt || ''
        this.expiredAt = obj?.expiredAt || ''
        this.user = new TransactionUser(obj?.user || {})
    }
}

export interface IResponseTopupTransactions {
    data: TransactionTopup[],
    page: number,
    totalPage: number
}

export class TransactionWithdraw{
    id: string
    user: TransactionUser
    amount: 0
    receiveBank: string
    receiveBankName: string
    receiveBankShortName: string
    receiveBankAccountNumber: string
    receiveBankAccountHolder: string
    status: TTransactionWithdrawStatus
    feedback: string
    createdAt: string
    updatedAt: string
    systemWalletAddress: string
    constructor()
    constructor(obj?: TransactionWithdraw)
    constructor(obj?: any){
        this.id = obj?.id || ''
        this.user = new TransactionUser(obj?.user || {})
        this.amount = obj?.amount || 0
        this.receiveBank = obj?.receiveBank ||''
        this.receiveBankAccountHolder = obj?.receiveBankAccountHolder || ''
        this.receiveBankAccountNumber = obj?.receiveBankAccountNumber || ''
        this.status = obj?.status || 'pending'
        this.feedback = obj?.feedback || ''
        this.updatedAt = obj?.updatedAt || ''
        this.createdAt = obj?.createdAt || ''
        this.systemWalletAddress = obj?.systemWalletAddress || ''
    }
}

export interface IResponseWithdrawTransactions {
    data: TransactionWithdraw[],
    page: number,
    totalPage: number
}

export class TransactionContract {
    _id?: string;
    timestamp: number;
    blockNumber: number;
    from: string;
    to: string;
    path: string[]
    amountAsset: number;
    amountCurrency: number;
    amount: number;
    method: "swapTokensForExactTokens" | "swapExactTokensForTokens" | "transfer";
    isError: string
    createAt?: Date
    assetAddress?: string

    constructor()
    constructor(obj?: TransactionContract)
    constructor(obj?: any) {
        this._id = obj?._id || null
        this.timestamp = obj?.timestamp || '';
        this.from = obj?.from || '';
        this.to = obj?.to || '';
        this.path = obj?.path || [];
        this.amountAsset = obj?.amountAsset || null;
        this.amountCurrency = obj?.amountCurrency || null;
        this.amount = obj?.amount || null;
        this.method = obj?.method || '';
        this.createAt = obj?.createAt || null
        this.isError = obj?.isError || null;
        this.assetAddress = obj?.assetAddress || null;
    }
}
