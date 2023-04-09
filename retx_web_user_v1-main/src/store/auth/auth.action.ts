import Router from 'next/router'
import cookie from 'react-cookies'

import { AppThunk, dispatch } from '@store/index'
import { sliceActions } from '@store/auth/auth.slice'
import { authApi } from '@apis/index'
import { alertActions, assetActions, contractActions } from '../actions'
import {User} from 'src/models/user/user.model'
import { trans } from 'src/resources/trans'
import { findLocalItems } from '@utils/functions'

function createUsername(input: string) {
    if (input.includes("@")) {
      return { email: input };
    } else if (/^\d+$/.test(input)) {
      return { phoneNumber: input };
    } else {
      return {}
    }
  }

export const login = (data: {
    phoneNumber: string,
    password: string,
    locate: 'vi'|'en',
    noToHomePage?: boolean,
    isNoAlertSuccess?: boolean,
    captchaToken: string
}): AppThunk => async (dispatch) => {
    try{
        dispatch(sliceActions.loadingLogin())
        let response = await authApi.login({
            ...createUsername(data.phoneNumber),
            password: data.password,
            captchaToken: data.captchaToken
        })

        dispatch(sliceActions.loginSuccess())

        if (!data.noToHomePage){
            Router.push('/')
        }
       
        cookie.remove("noti_not_match_address")

        cookie.save('access_token', response.accessToken, {path: '/'})
        cookie.save('refresh_token', response.refreshToken, {path: '/'})

        if (!data.isNoAlertSuccess){
            dispatch(alertActions.alertSuccess(trans[data.locate].login_successfully))
        }
        dispatch(assetActions.loadCart())

        let items = findLocalItems(/\bnotViewBoxConfirmSwap_/gm)
        items.forEach(item => {
            localStorage.removeItem(item.key)
        })
    }
    catch(e){
        console.log(e)
        dispatch(sliceActions.loginFail())
        e?.message && dispatch(alertActions.alertError(e.message) )
        // dispatch(alertActions.alertError(trans[data.locate][e.message]) )
    }
    finally{
        dispatch(authenticate())
    }
}

// export const registerSuccess = (data: {
//     user: User,
//     access_token: string
// }): AppThunk => async (dispatch) => {
//     dispatch(sliceActions.loginSuccess())
//     cookie.save('access_token', data.access_token, {path: '/'})
// }

export const authenticate = (): AppThunk => async (dispatch) => {
    try{
        let user = await authApi.authenticate()
        dispatch(sliceActions.authenticateSuccess(user))

    }
    catch(e){
        dispatch(sliceActions.authenticateFail())
        cookie.remove("access_token")
        cookie.remove("refresh_token")
        console.log(e)
    }
}

export const logout = (): AppThunk => async (dispatch) => {
    try{
        // dispatch(contractActions.self.logoutSuccess())
        dispatch(sliceActions.logout())
        await authApi.logout()
    }
    catch(e){
        console.log(e)
    }
}

export const nextStepRegister = sliceActions.nextStepRegister
export const backStepRegister = sliceActions.backStepRegister
export const resetStepRegister = sliceActions.resetStepRegister
export const resendCodeSuccess = sliceActions.resendCodeSuccess
export const verifyIdCardSuccess = sliceActions.verifyIdCardSuccess
export const backKycStep = sliceActions.backKycStep
export const updateIdCard = sliceActions.updateIdCard
export const updateKYCSuccess = sliceActions.updateKYCSuccess
export const nextKycStep = sliceActions.nextKycStep
export const resetKycStep = sliceActions.resetKycStep
export const resetForgotStep = sliceActions.resetForgotStep
export const nextForgotStep = sliceActions.nextForgotStep
export const backForgotStep = sliceActions.backForgotStep
export {sliceActions as self}