import router from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { CircleSpinner } from "react-spinners-kit";
import { ChangeEvent, useEffect, useState } from "react";
import cookie from 'react-cookies'

import { alertActions, authActions } from "@store/actions";
import { authApi, userApi } from "@apis/index";
import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { routeNames } from "@utils/router";
import { trans } from "src/resources/trans";
import RegBtnSubmit from "./btn_submit";


export default function RegFormStep3() {

    const dispatch = useDispatch()
    const TIME_EXPIRED = 60
    
    const {locate} = useSelector(locateSelector)
    const { userResiger, otpTokenPhone} = useSelector(authSelector)

    const [resendLoading, setResendLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [emailCode, setEmailCode] = useState('')
    const [errorsMessage, setErrorsMessage] = useState({})


    const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorsMessage({})
        setSubmitLoading(true)

        try{

            let {otpToken} = await authApi.otpVerify({
                type: 'email',
                userId: userResiger.userId,
                otpCode: emailCode,
                scenario: 'register_user'
            })
            dispatch(authActions.nextStepRegister())
            
            let user = await userApi.registerNewUser({
                userId: userResiger.userId,
                otpTokenEmail: otpToken,
                otpTokenPhone
            })
            dispatch(authActions.self.loginSuccess())
            cookie.save('access_token', user.accessToken, {path: '/'})
            dispatch(alertActions.alertSuccess(trans[locate].register_success))
        }
        catch(e) {
            console.log(e)
            e?.message && setErrorsMessage({code: e?.message})
        }
        setSubmitLoading(false)
    }

    const resendCode = async ()=>{
        if (!resendLoading){
            setResendLoading(true)
            try{
                await authApi.otpSend({
                    type: 'email',
                    userId: userResiger.userId,
                    scenario: 'register_user',
                })
                setErrorsMessage({})
                dispatch(alertActions.alertSuccess(trans[locate].resend_verification_code_to_your_email_successfully))
                setEmailCode('')
            }
            catch(err){
                console.log(err);
            }
            setResendLoading(false)
            setSubmitLoading(false)

        }
    }



    return (
        <div className="d-flex flex-column align-items-center">

            <a onClick={() => router.push(routeNames.home)} role="button" style={{
                fontSize: '1.2rem',
                width: 35, height: 35,
                borderRadius: 5,
                color: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: 5, right: 5,
                border: '1px solid #3333'
            }}>
                <i style={{ color: '#FEC128' }} className="fa-solid fa-xmark-large"></i>
            </a>

            <div className="title">
                <h5 className="text-center text-uppercase">{trans[locate].verify_your_email}</h5>
                <h6 className="text-center">{trans[locate].your_verification_code_is_sent_by_email_to} {userResiger.email.slice(0, 3)}***{userResiger.email.slice(userResiger.email.indexOf("@"))}</h6>
            </div>

            <form onSubmit={onSubmit} className={"w-100"}>
            <span className="mb-2 text-center" style={{ display: 'block', fontSize: 13, fontWeight: '600', color: '#F35757' }}>{trans[locate].effective_for} 15 {trans[locate].minute}</span>                <div className="mt-0 w-100">
                    <input 
                    onChange={e => setEmailCode(e.target.value)} 
                    value={emailCode}
                    className={`auth-page--form-input-register w-100 ${errorsMessage['code'] && 'error'}`}
                    type="text"
                     placeholder={trans[locate].enter_verification_code}
                    />
                    {errorsMessage['code'] && <h6 className="auth-page--input-message-error">{errorsMessage['code']}</h6> }
                
                </div>
                
                <div className="d-flex align-items-center mt-2">
                        <a onClick={resendCode} role="button" style={{ textDecoration: "underline", marginTop: 5, display: "block" }}>{trans[locate].resend_verification_code}</a>
                        {resendLoading && (
                            <div className="ms-2">
                                <CircleSpinner color="#E9B261" size={15} />
                            </div>
                        )}

                    </div>

                <div className="mt-4">
                    <RegBtnSubmit type="next" title={trans[locate].next} loading={submitLoading} />
                </div>
            </form>
        </div>
    )
}