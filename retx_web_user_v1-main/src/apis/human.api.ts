import { baseApi } from "./axios_client";
import { IResponse } from "src/models/response.model";
import { Human } from "src/models/response/human.model";
import { urls } from ".";


export function getHumans (
    type: 'team' | 'partner' | 'advisor'
){
    return baseApi<IResponse<Human[]>>({
        url: urls.getHumans(type),
        method: 'GET'
    })
}

