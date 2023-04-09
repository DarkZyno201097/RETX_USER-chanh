import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircleSpinner } from "react-spinners-kit";

import { alertActions, authActions } from "@store/actions";
import { authApi, userApi } from "@apis/index";
import RegBtnSubmit from "@components/register/btn_submit";
import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { trans } from "src/resources/trans";


export default function ForgotPasswordStep2() {

    const dispatch = useDispatch()
    
    const {locate} = useSelector(locateSelector)
    const {dataEncode, emailVerify, forgotTypeVerify} = useSelector(authSelector)

    const [resendLoading, setResendLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [emailCode, setEmailCode] = useState('')
    const [errorsMessage, setErrorsMessage] = useState({})

    const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorsMessage({})
        setSubmitLoading(true)

        try{

            const {otpToken} = await authApi.otpVerify({
                type: forgotTypeVerify,
                otpCode: emailCode,
                scenario: 'reset_user_password',
                details: {
                    [forgotTypeVerify == 'email' ? 'email' :'phoneNumber'] : emailVerify
                }
            })
            // console.log(data)
            dispatch(authActions.self.submitForgotPasswordVerifiedSuccess(otpToken))
        }
        catch(e) {
            console.log(e)
            if (e?.errors)
            setErrorsMessage({...e.errors})
        }
        setSubmitLoading(false)
    }

    const resendCode = async ()=>{
        if (!resendLoading){
            setResendLoading(true)
            try{
                await authApi.otpSend({
                    type: forgotTypeVerify,
                    scenario: 'reset_user_password',
                    details: {
                        [forgotTypeVerify == 'email' ? 'email' : 'phoneNumber']: emailVerify
                    }
                })
             
                setErrorsMessage({})
                dispatch(alertActions.alertSuccess(
                    forgotTypeVerify == 'email' ? trans[locate].resend_verification_code_to_your_email_successfully: trans[locate].resend_verification_code_to_your_phone_number_successfully
                ))
                setEmailCode('')
            }
            catch(err){
                console.log(err);
            }
            setResendLoading(false)
        }
    }



    return (
        <div className="d-flex flex-column align-items-center register-step1--form w-100" style={{maxWidth:'400px'}}>

            <a href={"/"} role="button" style={{
                fontSize: '1.2rem',
                // backgroundColor: '#FEC128',
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

            {forgotTypeVerify == 'email' ? (
                <div className="title mb-2">
                    <h5 className="text-center text-uppercase">{trans[locate].verify_your_email}</h5>
                    <h6 className="text-center">{trans[locate].your_verification_code_is_sent_by_email_to} {emailVerify.slice(0, 3)}***{emailVerify.slice(emailVerify.indexOf("@"))}</h6>
                </div>
            ) : (
                <div className="title mb-2">
                    <h5 className="text-center text-uppercase">{trans[locate].verify_your_phone_number}</h5>
                    <h6 className="text-center">{trans[locate].your_verification_code_is_sent_to_phone_number} {emailVerify.slice(0, 3)}***{emailVerify.slice(-3)}</h6>
                </div>
            )}

          
            <form onSubmit={onSubmit} className="register-step1--form w-100">
                <span className="text-center" style={{ display: 'block', fontSize: 13, fontWeight: '600', color: '#F35757' }}>{trans[locate].effective_for} 15 {trans[locate].minute}</span>
                <div className="mt-0">
                    <input 
                    onChange={e => setEmailCode(e.target.value)} 
                    value={emailCode}
                    className={`auth-page--form-input-register  ${errorsMessage['code'] && 'error'}`}
                    type="text"
                     placeholder={trans[locate].enter_verification_code}
                    />
                    {errorsMessage['code'] && <h6 className="auth-page--input-message-error">{trans[locate][errorsMessage['code']]}</h6> }
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
                    <RegBtnSubmit type="next" title={trans[locate].next} loading={submitLoading} style={{maxWidth: '100%'}} />
                </div>
            </form>
        </div>
    )
}