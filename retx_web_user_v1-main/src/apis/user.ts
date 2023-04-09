import { baseApi } from "./axios_client";
import { SmartContract, TransactionDTO } from "src/models/smart_contract.model";
import { InfoOwner, User, UserDTO, UserRegisterDTO, UserUpdateKycDTO } from "src/models/user/user.model";
import { urls } from ".";
import { RealEstateAssetView, TAssetType } from "src/models/asset/real_estate.model";
import { P2PTransaction } from "src/models/user/p2p-transaction.model";
import { Asset } from "src/models/asset/asset.model";
import { ICart } from "src/models/cart.model";

const ENDPOINT_IDENTITY_API = process.env.ENDPOINT_IDENTITY_API

export function registerNewUser(data: {
    userId: string,
    otpTokenPhone: string,
    otpTokenEmail: string
}){
    return baseApi<User>({
        endpoint: ENDPOINT_IDENTITY_API,
        url: urls.registerNewUser,
        method: 'POST',
        headers: {
            "otp-token-phone": data.otpTokenPhone,
            "otp-token-email": data.otpTokenEmail,
        },
        data: {
            userId: data.userId
        }
    })
}

export function validateUserRegister(data: UserRegisterDTO){
    return baseApi<{userId: string}>({
        endpoint: ENDPOINT_IDENTITY_API,
        url: urls.validateUserRegister,
        method: 'POST',
        data
    })
}

export function userUpdateWallet(data: {
    walletAddress: string;
    chainId:string;
}){
    return baseApi<{data: {
        user: User
    }}>({
        endpoint: ENDPOINT_IDENTITY_API,
        url: urls.userUpdateWallet,
        method: 'PUT',
        data
    })
}


export function recognizeIdCard(image: File){
    let formData = new FormData();
    formData.append('uploadFile', image)
    return baseApi({
        endpoint: ENDPOINT_IDENTITY_API,
        url: urls.recognizeIdCard,
        method: 'POST',
        headers:{
            "Content-Type": "multipart/form-data",
        },
        data: formData
    })
}

export function updateKYC(data: UserUpdateKycDTO){

    let formData = new FormData();
    let keys = Object.keys(data)
    keys.forEach(key=>{
        formData.append(key, data[key])
    })

    return baseApi<{message: string, user: any}>({
        endpoint: ENDPOINT_IDENTITY_API,
        url: urls.usersUpdateKyc,
        method: 'PUT',
        headers:{
            "Content-Type": "multipart/form-data"
        },
        data: formData
    })
}

export function userForgotPassword(data: {
    identity: string,
    newPassword: string,
    otpToken: string,
    details: object
}){

    return baseApi<{data: {dataEncode: string, email: string}}>({
        endpoint: ENDPOINT_IDENTITY_API,
        url: urls.userForgotPassword,
        method: 'POST',
        headers: {
            [`otp-token-${data.identity == 'email' ? 'email' : 'phone'}`]: data.otpToken
        },
        data: {
            newPassword: data.newPassword,
            details: data.details
        }
    })
}

export function uploadAvatar(file: File){

    let formData = new FormData();
    formData.append('avatar', file)

    return baseApi<{message: string, user: any}>({
        url: urls.userUploadAvatar,
        method: 'PUT',
        headers:{
            "Content-Type": "multipart/form-data"
        },
        data: formData
    })
}

export function removeAvatar(){
    return baseApi<{message: string, user: any}>({
        url: urls.userRemoveAvatar,
        method: 'GET',
    })
}


export function updatePassword(data: {
    oldPassword: string,
    newPassword: string
}){
    return baseApi<{message: string}>({
        url: urls.userUpdatePassword,
        method: "PUT",
        data
    })
}

export function cartAdd(data:{
    assetId: string,
    attributes: object
}){
    return baseApi<{cart: any}>({
        url: urls.userCartAdd,
        method: 'POST',
        data
    })
}

export function cartRemove(cartId: string){
    return baseApi({
        url: urls.userCartRemove(cartId),
        method: 'DELETE',
    })
}

export function cartList(assetType: TAssetType | 'all'){
    return baseApi<ICart[]>({
        url: urls.userCartList(assetType),
        method: 'GET',
    })
}

export function myRating(){
    return baseApi({
        url: urls.userMyRating,
        method: 'GET',
    })
}

export function deleteMyRating(commentId: string){
    return baseApi({
        url: urls.userDeleteMyRating(commentId),
        method: 'DELETE'
    })
}

export function checkIdCard(idCard: string){
    return baseApi({
        endpoint: ENDPOINT_IDENTITY_API,
        url: urls.userCheckIdCard(idCard),
        method: 'GET'
    })
}


export function userRegisterVerifyEmailResend(data: {
    dataEncode: string;
}){
    return baseApi<{data: {
        message: string,
        dataEncode: string
    }}>({
        url: urls.userRegisterVerifyEmailResend,
        method: "POST",
        data
    })
}


export function validatePhoneNumber (data: {userId: string, phoneNumber: string}){
    return baseApi({
        url: urls.validatePhoneNumber(data),
        method: 'GET'
    })
}

export function updatePhoneNumber (data: {
    phoneNumber: string,
    confirmSmsOtpToken: string,
    otpToken: string
}){
    return baseApi({
        url: urls.updatePhoneNumber,
        method: 'PUT',
        headers: {
            "otp-token-phone": data.otpToken,
        },
        data: {
            phoneNumber: data.phoneNumber,
            confirmSmsOtpToken: data.confirmSmsOtpToken
        }
    })
}

export function getTransactionStableCoin(){
    return baseApi<TransactionDTO[]>({
        url: urls.getTransactionStableCoin,
        method: 'GET'
    })
}

export function updateEmail(data: {
    email: string,
    confirmEmailOtpToken: string,
    otpToken: string
}){
    return baseApi({
        endpoint: ENDPOINT_IDENTITY_API,
        url: urls.userUpdateEmail,
        method: 'PUT',
        headers: {
            "otp-token-email": data.otpToken,
        },
        data: {
            confirmEmailOtpToken: data.confirmEmailOtpToken,
            email: data.email,
        }
    })
}

export function isExistUsername(username: string){
    return baseApi<boolean>({
        url: urls.isExistUsername(username),
        method: 'GET'
    })
}

export function getInfoUserByWallet(walletAddress: string){
    return baseApi<InfoOwner>({
        url: urls.getInfoUserByWallet(walletAddress),
        method: 'GET'
    })
}

export function getP2PTransaction(){
    return baseApi<{data: P2PTransaction[], lastBlockNumber: number}>({
        url: urls.getP2PTransaction,
        method: 'GET'
    })
}

export function updateP2PTransaction(data: P2PTransaction[]){
    return baseApi<P2PTransaction>({
        url: urls.updateP2PTransaction,
        method: 'POST',
        data
    })
}