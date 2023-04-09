import { baseApi } from "./axios_client";
import { urls } from ".";


export function getBanners(){
    return baseApi({
        url: urls.getBanners,
        method: 'GET'
    })
}
