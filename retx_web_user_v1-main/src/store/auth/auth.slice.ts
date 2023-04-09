import cookie from 'react-cookies'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { RootState } from '@store/reducer'
import { User, UserRegisterDTO } from 'src/models/user/user.model'
import { IdCardBack, IdCardFront } from 'src/models/user/id_card.model'

export interface AuthState {
    authenticated: boolean,
    loadingAuthenticate: boolean,
    user: User,
    loadingLogin: boolean,
    regStep: number,
    userResiger: UserRegisterDTO,
    verifyUserRegister: {
        email: boolean,
        phoneNumber: boolean
    },
    dataEncode: string,
    kycStep: number,
    idCardVerify: {
        front: IdCardFront,
        back: IdCardBack,
    },
    idCardFrontFile: File,
    idCardBackFile: File,
    forgotStep: number,
    userEncode: string,
    emailVerify: string,
    forgotTypeVerify: 'sms' | 'email',
    otpToken: string,
    otpTokenPhone: string,
    otpTokenEmail: string
}

export const initialState: AuthState = {
    authenticated: false,
    loadingAuthenticate: true,
    user: new User(),
    loadingLogin: false,
    regStep: 1,
    userResiger: new UserRegisterDTO(),
    verifyUserRegister: {
        email: false,
        phoneNumber: false
    },
    dataEncode: '',
    userEncode: '',
    kycStep: 1,
    idCardVerify: {
        front: new IdCardFront(),
        back: new IdCardBack(),
    },
    idCardFrontFile: null,
    idCardBackFile: null,
    forgotStep: 1,
    emailVerify: '',
    forgotTypeVerify: 'email',
    otpToken: '',
    otpTokenEmail: '',
    otpTokenPhone: ''
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loadingLogin: (state)=>{
            state.loadingLogin = true
        },
        loginSuccess: (state) => {
            state.authenticated = true;
            state.loadingLogin = false
        },
        loginFail: (state) => {
            state.authenticated = false;
            state.user = new User()
            state.loadingLogin = false
        },

        authenticateSuccess: (state, {payload}: PayloadAction<User>)=>{
            state.authenticated = true;
            state.user = payload
            state.loadingAuthenticate = false
        },
        authenticateFail: (state)=>{
            state.authenticated = false;
            state.user = new User()
            state.loadingAuthenticate = false
        },

        logout: (state) => {
            state.authenticated = false;
            state.user = new User()
            cookie.remove('access_token')
        },

        nextStepRegister: (state) => {
            state.regStep += 1;
        },
        backStepRegister: (state) => {
            if (state.regStep <= 1) state.regStep = 1;
            else state.regStep -= 1;
        },
        resetStepRegister: (state) => {
            state.regStep = 1;
        },

        requestVerifyEmailSuccess: (state, {payload}: PayloadAction<string>) => {
            state.dataEncode = payload
        },
        verifyEmailSuccess: (state, {payload}: PayloadAction<string>) => {
            state.dataEncode = payload;
            state.verifyUserRegister = {
                ...state.verifyUserRegister,
                email: true
            }    
        },
        requestVerifyPhoneSuccess: (state, {payload}: PayloadAction<string>) => {
            state.dataEncode = payload
        },
        verifyPhoneSuccess: (state, {payload}: PayloadAction<string>) => {
            state.otpTokenPhone = payload;
            state.verifyUserRegister = {
                ...state.verifyUserRegister,
                phoneNumber: true
            }    
        },
        cacheUserRegisting: (state, {payload}: PayloadAction<UserRegisterDTO>) => {
            state.userResiger = payload
        },

        resendCodeSuccess: (state, {payload}: PayloadAction<{dataEncode: string}>)=>{
            state.dataEncode = payload.dataEncode;
        },

        nextKycStep: (state) => {
            state.kycStep += 1;
        },
        backKycStep: (state) => {
            if (state.kycStep <= 1) state.kycStep = 1;
            else state.kycStep -= 1;
        },
        resetKycStep: (state) => {
            state.kycStep = 1;
        },

        verifyIdCardSuccess: (state, {payload}: PayloadAction<{
            idCard: {front: IdCardFront, back: IdCardBack},
            idCardFrontFile: File,
            idCardBackFile: File,
        }>) => {
            state.idCardVerify = payload.idCard;
            state.idCardFrontFile = payload.idCardFrontFile;
            state.idCardBackFile = payload.idCardBackFile;
            state.kycStep += 1;
        },
        updateIdCard: (state, {payload}: PayloadAction<{front: IdCardFront, back: IdCardBack}>) =>{
            state.idCardVerify = payload;
        },
        updateKYCSuccess: (state, {payload}: PayloadAction<any>) => {
            state.user = {...state.user, ...payload}
            state.kycStep = 3;
        },

        nextForgotStep: (state) => {
            state.forgotStep += 1;
        },
        backForgotStep: (state) => {
            if (state.forgotStep <= 1) state.forgotStep = 1;
            else state.forgotStep -= 1;
        },
        resetForgotStep: (state) => {
            state.forgotStep = 1;
        },

        submitRequestForgotPasswordSuccess: (state, {payload}: PayloadAction<{ email: string, type: 'sms' | 'email'}>) => {
            // state.dataEncode = payload.dataEncode
            state.forgotStep += 1;
            state.emailVerify = payload.email;
            state.forgotTypeVerify = payload.type

        },
        submitForgotPasswordVerifiedSuccess: (state, {payload}: PayloadAction<string>) => {
            state.otpToken = payload
            state.forgotStep += 1;
        },
        submitForgotPasswordSuccess: (state) => {
            state.dataEncode = ''
            state.userEncode = ''
            state.forgotStep += 1;
            state.emailVerify = ''
        },

        registerVerifyEmailSuccess: (state, {payload}: PayloadAction<{dataEncode: string}>)=>{
            state.dataEncode = payload.dataEncode
        },

        verifyWalletSuccess: (state, {payload}: PayloadAction<{addressWallel: string, chainId: string}>)=>{
            state.user.walletAddress = payload.addressWallel;
            state.user.chainId = payload.chainId;
        },

        updateUser: (state, {payload}: PayloadAction<User>)=>{
            state.user = payload
        }

    },
})

export const sliceActions = authSlice.actions
export const authReducer = authSlice.reducer
export const authSelector = (state: RootState) => state.auth