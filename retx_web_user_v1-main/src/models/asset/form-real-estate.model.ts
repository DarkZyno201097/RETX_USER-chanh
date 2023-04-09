import { IMultiLanguages } from "../lang.model";

export class FormRealEstateAsset {
    _id?: string;
    name: IMultiLanguages<string>
    createdAt: string;
    updatedAt: string;
    
    constructor(obj?: FormRealEstateAsset){
        this._id = obj?._id || ''
        this.name = {
            vi: obj?.name?.vi,
            en: obj?.name?.en,
        }
        this.createdAt = obj?.createdAt || ''
        this.updatedAt = obj?.updatedAt || ''
    }
}