import { baseApi } from "./axios_client";
import { User } from "src/models/user/user.model";
import { urls } from ".";
import { TTypeOTP } from "src/models/otp.model";


export function login (data: {
    [x: string]: string, // x là phoneNumber hoặc email
}){
    return baseApi<{refreshToken: string, accessToken: string}>({
        endpoint: process.env.ENDPOINT_IDENTITY_API,
        url: urls.login,
        method: 'POST',
        data
    })
}

export function logout(){
    return baseApi({
        endpoint: process.env.ENDPOINT_IDENTITY_API,
        url: urls.logout,
        method: 'POST'
    })
}

export function authenticate(){
    return baseApi<User>({
        endpoint: process.env.ENDPOINT_IDENTITY_API,
        url: urls.authenticate,
        method: 'GET'
    })
}

export function otpSend(data:{
    type: TTypeOTP,
    userId?: string,
    scenario: string,
    details?: {
        [x: string]: string,
    },
    captchaToken?: string
}){
    return baseApi<{expiredCodeAt: string}>({
        endpoint: process.env.ENDPOINT_IDENTITY_API,
        url: urls.otpSend,
        method: 'POST',
        data
    })
}

export function otpVerify(data: {
    type: TTypeOTP,
    userId?: string,
    otpCode: string,
    scenario: string,
    details?: {
        [x: string]: string,
    }
}){
    return baseApi<{otpToken: string}>({
        endpoint: process.env.ENDPOINT_IDENTITY_API,
        url: urls.otpVerify,
        method: 'POST',
        data
    })
}