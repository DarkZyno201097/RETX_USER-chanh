import router from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircleSpinner } from "react-spinners-kit";

import { alertActions, authActions } from "@store/actions";
import { userApi } from "@apis/index";
import { locateSelector } from "@store/locate/locate.slice";
import { routeNames } from "@utils/router";
import { isContainsNumber } from "@utils/string";
import { trans } from "src/resources/trans";


export default function ProfileChangePassword() {
    const dispatch = useDispatch()
    const { locate } = useSelector(locateSelector)

    const [validatePassword, setValidatePassword] = useState({
        minimum_lenght_8: false,
        digit: false
    })
    const [validateForm, setValidateForm] = useState({})
    const [password, setPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loadingSubmit, setLoadingSubmit] = useState(false)


    const onSubmit = async (e: ChangeEvent<HTMLFormElement>)=>{
        if (loadingSubmit) return;
        e.preventDefault();
        setValidateForm({})

        setLoadingSubmit(true)
        try {
            await userApi.updatePassword({
                oldPassword: password,
                newPassword
            })
            setPassword("")
            setNewPassword("")
            setConfirmPassword("")
            dispatch(alertActions.alertSuccess(trans[locate].change_password_successfully))
            router.push(routeNames.login)
            setTimeout(() => {
                dispatch(authActions.logout())
            }, 1000);

        }
        catch (err) {
            console.log(err)
            err?.errors && setValidateForm(err.errors)
        }
            setLoadingSubmit(false)

    }

    return (
        <div>
            <form onSubmit={onSubmit} className="profile-content--info">
                <div className="info--field"> 
                    <label >{trans[locate].current_password}</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    {validateForm['oldPassword'] && (
                        <h6 style={{ fontSize: 14 }} className="auth-page--input-message-error">
                            {validateForm['oldPassword']}
                        </h6>
                    )}
                    <div className="d-flex justify-content-end">
                    <a href={routeNames.forgotPassword} className="mt-1 d-inline-block" style={{ color: '#4A4A4A', textAlign: 'right', width: 'fit-content' }} >{trans[locate].forgot_password}</a>
                    </div>
                </div>
                <div className="info--field">
                    <label >{trans[locate].new_password}</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    {validateForm['newPassword'] && (
                        <h6 style={{ fontSize: 14 }} className="auth-page--input-message-error">
                            {validateForm['newPassword']}
                        </h6>
                    )}
                </div>
                <div className="info--field">
                    <label >{trans[locate].confirm_new_password}</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    {newPassword != confirmPassword && (
                        <h6 style={{ fontSize: 14 }} className="auth-page--input-message-error">
                            {trans[locate]['msg_error_input_confirm_password']}
                        </h6>
                    )}
                </div>

                <div 
                    className="mx-auto"
                    style={{
                        marginTop: 40 
                    }}
                >
                    <button type="submit" disabled={!(newPassword == confirmPassword)} className="button profile-content--btn-submit gap-2">
                        <span>{trans[locate].save}</span>
                        {loadingSubmit && <CircleSpinner size={18} />}
                    </button>
                </div>
            </form>
        </div>
    )
}