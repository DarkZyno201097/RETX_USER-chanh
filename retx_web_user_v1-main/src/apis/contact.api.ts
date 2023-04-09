import { baseApi } from "./axios_client";
import { urls } from ".";


export function getContact(){
    return baseApi({
        url: urls.getContact,
        method: 'GET'
    })
}

export function sendMessage(data: {
    name: string;
    email: string;
    message: string;
}){
    return baseApi({
        url: urls.sendMessage,
        method: 'POST',
        data
    })
}