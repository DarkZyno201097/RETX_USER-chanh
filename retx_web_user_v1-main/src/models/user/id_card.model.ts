export class IdCardFront {
    id: string // Số căn cước
    name: string
    dob: string // Ngày sinh
    sex: string // Giới tính
    nationality: string // Quốc tịch/Dân tộc
    type_new: string
    doe: string // Ngày hết hạn
    home: string // Nguyên quán
    address: string // Địa chỉ
    address_entities: { // phần địa chỉ gốc address sẽ được tách và chuẩn hóa thành 4 loại
        province: string
        district: string
        ward: string
        street: string
    }
    type: string

    constructor()
    constructor(obj?: IdCardFront)
    constructor(obj?: any){
        this.id = obj?.id || '';
        this.name = obj?.name || '';
        this.dob = obj?.dob || '';
        this.sex = obj?.sex || '';
        this.nationality = obj?.nationality || '';
        this.type_new = obj?.type_new || '';
        this.doe = obj?.doe || '';
        this.home = obj?.home || '';
        this.address = obj?.address || '';
        this.address_entities = obj?.address_entities || {
            province: '',
            district: '',
            ward: '',
            street: ''
        };
        this.type = obj?.type || ''
    }
}

export class IdCardBack {
    ethnicity: string // Dân tộc
    religion: string // Tôn giáo
    type_new: string
    features: string // Đặc điểm nhận dạng (Dấu vết riêng và dị hình)
    issue_date: string // Ngày cấp
    issue_loc: string // Nơi cấp
    type: string
    mrz: string

    constructor()
    constructor(obj?: IdCardBack)
    constructor(obj?: any){
        this.type_new = obj?.type_new || '';
        this.ethnicity = obj?.ethnicity || '';
        this.religion = obj?.religion || '';
        this.features = obj?.features || '';
        this.issue_date = obj?.issue_date || '';
        this.issue_loc = obj?.issue_loc || '';
        this.type = obj?.type || '';
        this.mrz = obj?.mrz || '';
    }
}