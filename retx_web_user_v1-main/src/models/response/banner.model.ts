export class Banner {
    _id: string;
    imageUrl: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;

    constructor();
    constructor(user: Banner);
    constructor(obj?: any) {
        this._id = obj?._id || ''
        this.imageUrl = obj?.imageUrl || ''
        this.content = obj?.content || ''
        this.createdAt = obj?.createdAt || ''
        this.updatedAt = obj?.updatedAt || ''
    }
}