import { ISendNotification } from "src/models/notification.model";
import { urls } from ".";
import { baseApi } from "./axios_client";

export function sendNotification(data: ISendNotification){
    return baseApi({
        url: urls.notification,
        method: "POST",
        data
    })
}