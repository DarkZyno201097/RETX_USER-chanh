import { IdCardBack, IdCardFront } from "./id_card.model";

export type TKycStatus = 'pending' | 'verified' | 'reject'

export class User {
    name: string;
    email: string;
    phoneNumber: string;
    kycStatus: TKycStatus;
    emailVerified: boolean;
    phoneNumberVerified: boolean;
    activeStatus: boolean;
    defaultOtpType: string;
    transactionActivated: boolean;
    hasUploadedKyc: boolean;
    walletAddress: string;
    id: string;
    dateOfBirth?: string;
    idCard?: string;
    address?: string;
    chainId: string; 
    avatarUrl?: string;
    accessToken?: string;

    constructor()
    constructor(obj?: User)
    constructor(obj?: any) {
        this.name = obj?.name || '';
        this.email = obj?.email || '';
        this.phoneNumber = obj?.phoneNumber || '';
        this.kycStatus = obj?.kycStatus || '';
        this.emailVerified = obj?.emailVerified || false;
        this.phoneNumberVerified = obj?.phoneNumberVerified || false;
        this.activeStatus = obj?.activeStatus || false;
        this.defaultOtpType = obj?.defaultOtpType || '';
        this.transactionActivated = obj?.transactionActivated || false;
        this.hasUploadedKyc = obj?.hasUploadedKyc || false;
        this.walletAddress = obj?.walletAddress || '';
        this.id = obj?.id || '';
        this.dateOfBirth = obj?.dateOfBirth || ''
        this.idCard = obj?.idCard || '';
        this.address = obj?.address || '';
        this.chainId = obj?.chainId || '';
        this.avatarUrl = obj?.avatarUrl || '';
        this.accessToken = obj?.accessToken || '';
    }
}

export class UserDTO extends User{
    avatar: any;
    imageIdCardFront: any;
    imageIdCardBack: any;
    rePassword: string;
    constructor()
    constructor(obj?: UserDTO)
    constructor(obj?: any){
        super(obj)
        this.avatar = obj?.avatar || '';
        this.imageIdCardFront = obj?.imageIdCardFront || ''
        this.imageIdCardBack = obj?.imageIdCardBack || ''
        this.rePassword = obj?.rePassword || ''
    }
}   

export class UserRegisterDTO{
    phoneNumber: string;
    email: string;
    password: string;
    userId: string;

    constructor(){
        this.phoneNumber = ''
        this.email = ''
        this.password = ''
        this.userId = ''
    }
}

export type KeyUserRegisterDTO = 'phoneNumber' | 'email' | 'password'


export class UserUpdateKycDTO {
    userId: string;
    fullname: string;
    gender: string;
    avatarFile: File;
    frontOfIdCardFile: File;
    backOfIdCardFile: File;
    dateOfBirth: string
    password: string
    idCardInfo: string;

    constructor();
    constructor(obj?: UserUpdateKycDTO);
    constructor(obj?: any){
        this.userId = obj?.userId || '';
        this.fullname = obj?.fullname || '';
        this.gender = obj?.gender || ''
        this.avatarFile = obj?.avatarFile || null
        this.frontOfIdCardFile = obj?.frontOfIdCardFile || null
        this.backOfIdCardFile = obj?.backOfIdCardFile || null
        this.dateOfBirth = obj?.dateOfBirth || null
        this.password = obj?.password || ''
        this.idCardInfo= obj?.idCardInfo || '{}'
    }
}

export class InfoOwner{
    name:string;
    email:string;
    createdAt: Date;
    constructor()
    constructor(obj?: InfoOwner)
    constructor(obj?: any){
        this.name = obj?.name || ''
        this.email = obj?.email || ''
        this.createdAt = new Date(obj?.createdAt || null)
    }
}