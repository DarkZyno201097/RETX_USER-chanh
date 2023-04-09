import { IMultiLanguages } from "./lang.model";


export type TRoleOrganization = 'inspectionUnit' | 'notarizationUnit' | 'securedAssetProtection' | 'investor' | 'valuationUnit'

export interface IRoleOrganization {
    role: TRoleOrganization
    name: IMultiLanguages<string>
}



export interface IOrganization {
    _id?: string;
    name: IMultiLanguages<string>;
    imageUrl: string;
    website: string
    taxCode: string
    role: TRoleOrganization
    officeAddress: {
        cityCode: string,
        districtCode: string,
        wardCode: string,
        address: string
    }
    createdAt: Date
    updatedAt: Date
}

export class Organization {
    _id?: string;
    name: IMultiLanguages<string>;
    imageUrl: string;
    website: string
    taxCode: string
    role: TRoleOrganization
    officeAddress: {
        cityCode: string,
        districtCode: string,
        wardCode: string,
        address: string
    }
    createdAt: Date
    updatedAt: Date
    constructor(obj?: IOrganization){
        this._id = obj?._id 
        this.name = {
            vi: obj?.name?.vi,
            en: obj?.name?.en,
        }
        this.imageUrl = obj?.imageUrl;
        this.website = obj?.website;
        this.taxCode = obj?.taxCode;
        this.role = obj?.role
        this.officeAddress = {
            cityCode: obj?.officeAddress?.cityCode,
            districtCode: obj?.officeAddress?.districtCode,
            wardCode: obj?.officeAddress?.wardCode,
            address: obj?.officeAddress?.address,
        };
        this.createdAt = obj?.createdAt
        this.updatedAt = obj?.updatedAt
    }
}


