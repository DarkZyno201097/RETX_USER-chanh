export class Human {
    _id: string;
    avatarUrl: string;
    translates: {
        vi: HumanTranslates,
        en: HumanTranslates
    }
    type: 'team' | 'advisor' | 'partner';
    url: string
    createdAt?: string;
    updatedAt?: string;

    constructor();
    constructor(user: Human);
    constructor(obj?: any) {
        this._id = obj?._id || "";
        this.avatarUrl = obj?.avatarUrl || ''
        this.translates = {
            vi: new HumanTranslates(obj?.translates.vi),
            en: new HumanTranslates(obj?.translates.en)
        }
        this.createdAt = obj?.createdAt || ''
        this.updatedAt = obj?.updatedAt || ''
        this.type = obj?.type || ''
        this.url = obj?.url || ''

    }
}


export class HumanTranslates{
    fullname: string;
    title: string;
    description: string;
    constructor()
    constructor(obj?: HumanTranslates)
    constructor(obj?: any){
        this.fullname = obj?.fullname || ''
        this.title = obj?.title || ''
        this.description = obj?.description || ''
    }
}
