export class Cities {
    name: string;
    slug: string;
    type: string;
    name_with_type: string;
    code: string;

    constructor()
    constructor(obj?: Cities)
    constructor(obj?: any) {
        this.name = obj?.name || '';
        this.slug = obj?.slug || '';
        this.type = obj?.type || '';
        this.name_with_type = obj?.name_with_type || '';
        this.code = obj?.code || '';
    }
}

export class Districts extends Cities {
    path: string;
    path_with_type: string;
    parent_code: string;

    constructor()
    constructor(obj?: Districts)
    constructor(obj?: any) {
        super(obj);
        this.parent_code = obj?.parent_code || '';
        this.path = obj?.path || '';
        this.path_with_type = obj?.path_with_type || '';
    }
}

export class Wards extends Districts {

}

export class Locations {
    cities: Cities[];
    districts: Districts[]
    wards: Wards[]
    constructor()
    constructor(obj?: Locations)
    constructor(obj?: any) {
        this.cities = obj?.cities || [];
        this.districts = obj?.districts || [];
        this.wards = obj?.wards || [];
    }

    getCitiesName(code: string) {
        return this.cities.filter(item => item.code == code)?.[0]?.name_with_type
    }

    getDictrictsName(code: string) {
        return this.districts.filter(item => item.code == code)?.[0]?.name_with_type
    }

    getWardsName(code: string) {
        return this.wards.filter(item => item.code == code)?.[0]?.name_with_type
    }

    getFull(codeCities: string, codeDistricts: string, codeWards: string) {
        return this.wards.filter(item => item.code == codeWards)?.[0]?.name_with_type + ', '  +
            this.districts.filter(item => item.code == codeDistricts)?.[0]?.name_with_type + ', '  +
            this.cities.filter(item => item.code == codeCities)?.[0]?.name_with_type
    }
}




export class AddressEntities {
    province: string
    district: string;
    ward: string;
    street: string;

    constructor()
    constructor(obj?: AddressEntities)
    constructor(obj?: any) {
        this.province = obj?.province || '';
        this.district = obj?.districts || '';
        this.ward = obj?.wards || '';
        this.street = obj?.street || '';

    }
}

export class Directions {
    id: string
    translates: {
        vi: {
            name: string
        },
        en: {
            name: string
        }
    }
    constructor(obj?: Directions){
        this.id = obj?.id || '';
        this.translates = {
            vi: {
                name: obj?.translates.vi.name || ''
            },
            en: {
                name: obj?.translates.en.name || ''
            }
        }
    }
}

export interface ILocation{
    cityCode: string
    districtCode: string;
    wardCode: string;
    address: string;
    embedLink: string;
}

export class Location {
    cityCode: string
    districtCode: string;
    wardCode: string;
    address: string;
    embedLink: string;

    constructor(obj: ILocation){
        this.cityCode = obj?.cityCode;
        this.districtCode = obj?.districtCode;
        this.wardCode = obj?.wardCode;
        this.address = obj?.address;
        this.embedLink = obj?.embedLink
    }
}
