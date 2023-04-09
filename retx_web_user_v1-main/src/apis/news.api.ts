import { baseApi } from "./axios_client";
import { IGetNews } from "src/models/response/news.model";
import { urls } from ".";


export function getNews({
    type, limit, page
}: IGetNews){
    return baseApi({
        url: urls.getNews(type, limit, page),
        method: 'GET',
    })
}