
export class RealEstateTranslates{
    name: string;
    description: string;
    juridicalContent: string;
    cashFollow : string;

    constructor()
    constructor(obj?: RealEstateTranslates)
    constructor(obj?: any){
        this.name = obj?.name || '';
        this.description = obj?.description || '';
        this.juridicalContent= obj?.juridicalContent || '';
        this.cashFollow = obj?.cashFollow || '';
    }
}