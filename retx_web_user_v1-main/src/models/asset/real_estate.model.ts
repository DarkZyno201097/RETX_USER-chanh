import { IMultiLanguages } from "../lang.model";
import { Location } from "../locations.model";
import { Organization } from "../organization.model";
import { FormRealEstateAsset } from "./form-real-estate.model";

export interface IPolicyAssetView {
    docUri: string;
    notarizationDate: Date;
    partiesJoin: {
        role: string;
        name: string;
        organizationId: string;
        roleId: string;
    }[]
    content: IMultiLanguages<string>
    notarizationUnit: Organization
}


export interface ILegalAssetView{
    docUri: string;
    inspectionDate: Date;
    isRedBook: boolean;
    isDispute: boolean;
    form: FormRealEstateAsset
    content: IMultiLanguages<string>
    inspectionUnit: Organization
}

export interface IValuationRecordAssetView{
    docUri: string;
    valuationDate: Date;
    valuationUnit: Organization
    valuation: number
}

export interface IDigitalInfoAssetView {
    assetAddress: string;
    nftAddress: string;
    ownerAddress: string;
    nftUri: string;
    totalSupply: number;
    decimals: number
    assetName: IMultiLanguages<string>
    assetSymbol: IMultiLanguages<string>
}
export interface IAdditionalInfoAssetView{
    area: number;
    direction: string;
    location: Location;
    purpose: string
}

export interface IRealEstateAssetView {
    _id?: string;
    nftId: string;
    avatarUrl: string;
    imagesUrl: string[];
    digitalInfo: IDigitalInfoAssetView
    additionalInfo: IAdditionalInfoAssetView
    information: IMultiLanguages<string>;
    contractInfo: {
        chainId: string;
    }
    legal: ILegalAssetView
    releasePolicy: IPolicyAssetView;
    recoveryPolicy: IPolicyAssetView;
    valuationRecord: IValuationRecordAssetView
    status: boolean
    createdAt: Date;
    updatedAt: Date;
}


export const ListAssetType  = ['single_asset', 'collection_asset', 'fund_rising_pool'] as const
export type TAssetType = typeof ListAssetType[number]

export class RealEstateAssetView {
    _id?: string;
    nftId: string;
    avatarUrl: string;
    imagesUrl: string[];
    digitalInfo: IDigitalInfoAssetView
    additionalInfo: IAdditionalInfoAssetView
    information: IMultiLanguages<string>;
    contractInfo: {
        chainId: string;
    }
    legal: ILegalAssetView
    releasePolicy: IPolicyAssetView;
    recoveryPolicy: IPolicyAssetView;
    valuationRecord: IValuationRecordAssetView
    status: boolean
    view: number;
    createdAt: Date;
    updatedAt: Date;
    price: number;
    poolSize: {
        asset: number;
        stableCoin: number;
    }
    ownerBalance: number;
    assetType: TAssetType
    priceFluctuation: number;
    attributes?: {
        priceRange?: {
            min: number,
            max: number
        },
        completeProcess?: number
    }
    qaCount: number;
    rateMean: number;

    constructor(obj?: RealEstateAssetView){
        this._id = obj?._id || '';
        this.nftId = obj?.nftId || ''
        this.avatarUrl= obj?.avatarUrl || ''
        this.imagesUrl = obj?.imagesUrl || []
        this.digitalInfo = {
            assetName:{
                vi: obj?.digitalInfo?.assetName?.vi || '',
                en: obj?.digitalInfo?.assetName?.en || ''
            },
            assetAddress: obj?.digitalInfo?.assetAddress || '',
            assetSymbol: {
                vi: obj?.digitalInfo?.assetSymbol?.vi || '',
                en: obj?.digitalInfo?.assetSymbol?.en || ''
            },
            nftAddress: obj?.digitalInfo?.nftAddress || '',
            ownerAddress: obj?.digitalInfo?.ownerAddress || '',
            nftUri: obj?.digitalInfo?.nftUri || '',
            totalSupply: obj?.digitalInfo?.totalSupply || 0,
            decimals: obj?.digitalInfo?.decimals || 0,
        }
        this.additionalInfo = {
            area: obj?.additionalInfo?.area || 0,
            direction: obj?.additionalInfo?.direction || '',
            location: new Location(obj?.additionalInfo?.location),
            purpose: obj?.additionalInfo?.purpose || ''
        }
        this.information = {
            vi: obj?.information?.vi || '',
            en: obj?.information?.en || '',
        }
        this.contractInfo = {
            chainId: obj?.contractInfo?.chainId || '',
        }
        this.legal = {
            docUri: obj?.legal?.docUri || '',
            inspectionDate: obj?.legal?.inspectionDate,
            inspectionUnit: obj?.legal?.inspectionUnit,
            isRedBook: obj?.legal?.isRedBook,
            isDispute: obj?.legal?.isDispute,
            form: obj?.legal?.form,
            content: {
                vi: obj?.legal?.content?.vi,
                en: obj?.legal?.content?.en
            }
        }
        this.releasePolicy = {
            docUri: obj?.releasePolicy?.docUri || '',
            notarizationDate: obj?.releasePolicy?.notarizationDate,
            notarizationUnit: obj?.releasePolicy?.notarizationUnit,
            partiesJoin: obj?.releasePolicy?.partiesJoin,
            content: {
                vi: obj?.releasePolicy?.content?.vi,
                en: obj?.releasePolicy?.content?.en
            }
        }
        this.recoveryPolicy = {
            docUri: obj?.recoveryPolicy?.docUri,
            notarizationDate: obj?.recoveryPolicy?.notarizationDate,
            notarizationUnit: obj?.recoveryPolicy?.notarizationUnit,
            partiesJoin: obj?.recoveryPolicy?.partiesJoin,
            content: {
                vi: obj?.recoveryPolicy?.content?.vi,
                en: obj?.recoveryPolicy?.content?.en
            }
        }
        this.valuationRecord = {
            docUri: obj?.valuationRecord?.docUri,
            valuationDate: obj?.valuationRecord?.valuationDate,
            valuationUnit: obj?.valuationRecord?.valuationUnit,
            valuation: obj?.valuationRecord?.valuation
        }
        this.view = obj?.view
        this.status = obj?.status
        this.updatedAt= obj?.updatedAt
        this.createdAt = obj?.createdAt
        this.price  = obj?.price || null
        this.poolSize = {
            asset: obj?.poolSize?.asset || null,
            stableCoin: obj?.poolSize?.stableCoin || null,
        }
        this.ownerBalance = obj?.ownerBalance || null
        this.assetType = obj?.assetType || null
        this.priceFluctuation = obj?.priceFluctuation || null
        this.attributes = obj?.attributes || null
        this.qaCount = obj?.qaCount || null
        this.rateMean = obj?.rateMean || null
    }

}