export class Contact{
    _id:string;
    address:string;
    hotline:string;
    email:string;
    facebookUrl: string;
    youtubeUrl: string;
    zaloUrl: string;
    mapEmbeded: string
    termsOfUse: string;

    constructor()
    constructor(obj?: Contact)
    constructor(obj?: any){
        this._id = obj?._id || '';
        this.address = obj?.address || ''
        this.hotline = obj?.hotline || ''
        this.email = obj?.email || ''
        this.facebookUrl = obj?.facebookUrl || ''
        this.youtubeUrl = obj?.youtubeUrl || ''
        this.zaloUrl = obj?.zaloUrl || ''
        this.mapEmbeded  = obj?.mapEmbeded || ''
        this.termsOfUse = obj?.termsOfUse || ''
    }
}

