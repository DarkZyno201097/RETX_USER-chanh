import { baseApi } from "./axios_client";
import { urls } from ".";


export function getLocations(){
    return baseApi({
        url: urls.getLocations,
        method: 'GET'
    })
}