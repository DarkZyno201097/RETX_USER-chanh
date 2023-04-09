import { User } from "./user/user.model";

export class Comments{
    _id?: string;
    userId: string;
    assetId: string;
    content: string;
    ratting: string;
    createdAt?: string;
    updatedAt?: string;

    constructor()
    constructor(obj?: Comments)
    constructor(obj?: any){
        this._id = obj?._id || ''
        this.userId = obj?.userId || ''
        this.assetId = obj?.assetId || ''
        this.content = obj?.content || ''
        this.ratting = obj?.ratting || ''
        this.createdAt = obj?.createdAt || ''
        this.updatedAt = obj?.updatedAt || ''
    }
}

export class CommentsQA{
    _id?: string;
    userId: string;
    assetId: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
    parentId: string;
    parent: CommentsQA[]

    constructor()
    constructor(obj?: CommentsQA)
    constructor(obj?: any){
        this._id = obj?._id || ''
        this.userId = obj?.userId || ''
        this.assetId = obj?.assetId || ''
        this.content = obj?.content || ''
        this.parentId = obj?.parentId || ''
        this.parent = obj?.parent || []
        this.createdAt = obj?.createdAt || ''
    }
}

export interface ICommentsQA {
    _id?: string;
    userId: {
        id: string;
        name: string;
        avatarUrl: string;
    };
    assetId: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
    parent: ICommentsQA[]
}

export class CommentsUser{
    _id?: string;
    userId: {
        id: string;
        name: string;
        avatarUrl: string;
    };
    assetId: string;
    content: string;
    ratting: string;
    createdAt?: string;
    updatedAt?: string;

    constructor()
    constructor(obj?: Comments)
    constructor(obj?: any){
        this._id = obj?._id || ''
        this.userId = obj?.userId || {}
        this.assetId = obj?.assetId || ''
        this.content = obj?.content || ''
        this.ratting = obj?.ratting || ''
    }
}