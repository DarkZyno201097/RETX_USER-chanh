export interface IGetNews {
    type: 'market' | 'company',
    limit?: number,
    page?: number
}

export class News {
    _id?: string;
    translates: {
        vi: NewsTranslates,
        en: NewsTranslates
    };
    url: string;
    type: 'market' | 'company';
    imageUrl: string;
    createdAt: string;
    updatedAt: string
   
    constructor();
    constructor(user: News);
    constructor(obj?: any) {
        this._id = obj?._id || ''
        this.translates = {
            vi: new NewsTranslates(obj?.translates?.vi),
            en: new NewsTranslates(obj?.translates?.en)
        }
        this.url = obj?.url || ''
        this.type = obj?.type || ''
        this.imageUrl = obj?.imageUrl || ''
        this.createdAt = obj?.createdAt || ''
        this.updatedAt = obj?.updatedAt || ''
    }
}

export class NewsTranslates {
    title: string;
    description: string;
    constructor();
    constructor(obj?: NewsTranslates)
    constructor(obj?: any){
        this.title = obj?.title || '';
        this.description = obj?.description || '';
    }

}