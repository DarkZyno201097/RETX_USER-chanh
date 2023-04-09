export interface IResponse <T> {
    message: string;
    errors: {
        [key: string]: string[]
    };
    data: T
    token: {
        accessToken: string,
        expiresTn: number,
    },
    pagination:{
        limit: number,
        page: number,
        totalPage: number
    }
}

export interface IErrorsValidateResponse{
    [key: string]: {
        id: string;
        message: string;
    }[]
}