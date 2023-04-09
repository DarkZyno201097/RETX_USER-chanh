
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { alertActions, authActions } from "@store/actions";
import { userApi } from "@apis/index";
import RegBtnSubmit from "@components/register/btn_submit";
import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { isContainsNumber } from "@utils/string";
import { trans } from "src/resources/trans";


export default function ForgotPassStep3() {
    const dispatch = useDispatch()

    const { locate } = useSelector(locateSelector)
    const {forgotTypeVerify, otpToken, emailVerify } = useSelector(authSelector)

    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [formErrors, setFormErrors] = useState({})

    const submit =  async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        setFormErrors({})
        let errors = {}

        if (newPassword != confirmNewPassword) {
            errors['confirmNewPassword'] = "msg_error_input_confirm_password"

        }

        if (Object.keys(errors).length > 0){
            return setFormErrors(errors)
        }
        else{   
            setLoadingSubmit(true)
            try{    
                await userApi.userForgotPassword({
                    identity: forgotTypeVerify,
                    newPassword,
                    otpToken,
                    details: {
                        [forgotTypeVerify == 'email' ? 'email' :'phoneNumber'] : emailVerify
                    }
                })
                dispatch(authActions.self.submitForgotPasswordSuccess())

            }
            catch(err){
                console.log(err)
                // err?.message && dispatch(alertActions.alertError(err.message))
                err?.errors && setFormErrors(err.errors)
            }
            setLoadingSubmit(false)
        }

    }


    const removeMsgError = (fieldname: 'newPassword' | 'confirmNewPassword') => {
        let temp = {...formErrors}
        delete temp[fieldname]
        setFormErrors(temp)
    }

    return (
        <form onSubmit={submit} className="auth-page--form">
            <h3 className="auth-page--form-title text-center text-uppercase mb-2">
                {trans[locate].change_password}
            </h3>
            <h6 className="text-center">{trans[locate].for_your_account_is_security_do_not_share_your_password_with_anyone_else}</h6>

            <div className="mt-4"></div>

            <div className="mb-3 w-100">
                <input
                    onChange={e => { setNewPassword(e.target.value); removeMsgError('newPassword')}}
                    type="password"
                    className={`auth-page--form-input mb-0 w-100 ${formErrors['newPassword'] && 'error'}`}
                    placeholder={trans[locate].new_password}
                />
                {formErrors['newPassword'] && <h6 className="auth-page--input-message-error">
                    {formErrors['newPassword']}
                    </h6>}

            </div>
            <div className="w-100">
                <input
                    onChange={e => { setConfirmNewPassword(e.target.value); removeMsgError('confirmNewPassword') }}
                    type="password"
                    className={`auth-page--form-input mb-1 w-100 ${formErrors['confirmNewPassword'] && 'error'}`}
                    placeholder={trans[locate].confirm_new_password}
                />
                {formErrors['confirmNewPassword'] && <h6 className="auth-page--input-message-error">{trans[locate][formErrors['confirmNewPassword']]}</h6>}
            </div>

            <div className="mt-3">
                <RegBtnSubmit type="next" title={trans[locate].next} style={{ maxWidth: '100%' }} loading={loadingSubmit} />
            </div>


        </form>
    )
}