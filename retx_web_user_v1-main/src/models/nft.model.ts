export type TTraitType = 'Asset Network' | 'Legal Verify Document' | 'Asset Address' | 'Asset Symbol' | 'Lock Documents' | 'Unlock Documents' | 'Valuation Documents'

export class InfoNftToken {
    name: string
    image: string
    description: string
    external_url: string
    animation_url: string
    animation_type: string
    attributes: {
        trait_type: string,
        value: string,
        display_type: string
    }[]
    uri: string
    id: string

    constructor(obj?: InfoNftToken) {
        this.name = obj?.name || ''
        this.image = obj?.image || ''
        this.description = obj?.description || ''
        this.external_url = obj?.external_url || ''
        this.animation_url = obj?.animation_url || ''
        this.animation_type = obj?.animation_type || ''
        this.attributes = obj?.attributes || []
        this.uri = obj?.uri || ''
        this.id = obj?.id || ''
    }

    getAttribute(trait_type: TTraitType){
        return this.attributes.find(item => item.trait_type == trait_type)
    }

    getAttributeAny(trait_type: string){
        return this.attributes.find(item => item.trait_type == trait_type)
    }
}


export class InfoCmd{
    maker: string;
    price: number;
    acceptor: string;
    is_open: boolean;
    constructor()
    constructor(obj?: InfoCmd)
    constructor(obj?: any){
        this.maker = obj?.maker?.toLowerCase() || null;
        this.price = parseInt(obj?.price) || null;
        this.acceptor = obj?.acceptor?.toLowerCase() || null;
        this.is_open = obj?.is_open || false
    }
}