export class Bank {
    id: string
    name: string
    code: string
    shortName: string
    logo: string
    constructor()
    constructor(obj?: Bank)
    constructor(obj?: any){
        this.id = obj?.id || '';
        this.name = obj?.name || '';
        this.code = obj?.code || '';
        this.shortName = obj?.shortName
        this.logo = obj?.logo || '';
    }
}

export class BankAccount {
    id: string
    bank: string
    name: string
    shortName: string
    accountHolder: string
    accountNumber: string
    description: string
    createdAt: string
    updatedAt: string
    archivedAt: string
    constructor()
    constructor(obj?: BankAccount)
    constructor(obj?: any) {
        this.id = obj?.id || '';
        this.bank = obj?.bank || '';
        this.accountHolder = obj?.accountHolder || '';
        this.accountNumber = obj?.accountNumber || '';
        this.description = obj?.description || '';
        this.createdAt = obj?.createdAt || '';
        this.updatedAt = obj?.updatedAt || '';
        this.archivedAt = obj?.archivedAt || '';
        this.name = obj?.name || '';
        this.shortName = obj?.shortName || '';
    }
}

