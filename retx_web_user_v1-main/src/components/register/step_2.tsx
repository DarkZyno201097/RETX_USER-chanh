import router from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircleSpinner } from "react-spinners-kit";

import { alertActions, authActions } from "@store/actions";
import { authApi, userApi } from "@apis/index";
import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { routeNames } from "@utils/router";
import { trans } from "src/resources/trans";
import RegBtnSubmit from "./btn_submit";


export default function RegFormStep2() {

    const TIME_EXPIRED = 60
    const dispatch = useDispatch()

    const { dataEncode, userResiger } = useSelector(authSelector)
    const {locate} = useSelector(locateSelector)

    const [resendLoading, setResendLoading] = useState(false)
    const [codeVerification, setCodeVerification] = useState('')
    const [submitLoading, setSubmitLoading] = useState(false)
    const [errorsMessage, setErrorsMessage] = useState({})
    const [errorValidate, setErrorValidate] = useState({})


    const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorsMessage({})
        setErrorValidate({})
        setSubmitLoading(true)


        try{
            let {otpToken} = await authApi.otpVerify({
                type: 'sms',
                userId: userResiger.userId,
                otpCode: codeVerification,
                scenario: 'verify_user_phone_number'
            })
            dispatch(authActions.self.verifyPhoneSuccess(otpToken))
          

            // request verify email
            await authApi.otpSend({
                type: 'email',
                userId: userResiger.userId,
                scenario: 'register_user'
            })

            setErrorValidate({})
            dispatch(authActions.nextStepRegister())
        }
        catch(e) {
            console.log(e)
            e?.message && setErrorValidate({code: e?.message})
        }
        setSubmitLoading(false)
    }

    const resendCode = async ()=>{
        if (!resendLoading){
            setResendLoading(true)
            try{
                await authApi.otpSend({
                    type: 'sms',
                    userId: userResiger.userId,
                    scenario: 'verify_user_phone_number'
                })
                setErrorsMessage({})
                setErrorValidate({})
                dispatch(alertActions.alertSuccess(trans[locate].resend_verification_code_to_your_phone_number_successfully))
                setCodeVerification('')
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
                <h5 className="text-center text-uppercase">{trans[locate].verify_your_phone_number}</h5>
                <h6 className="text-center">{trans[locate].your_verification_code_is_sent_to_phone_number} {userResiger.phoneNumber.slice(0, 3)}***{userResiger.phoneNumber.slice(-4)}</h6>
            </div>

            <form onSubmit={onSubmit} className={"w-100 d-flex flex-column align-items-center"}>
                <span className="mb-2 text-center" style={{ display: 'block', fontSize: 13, fontWeight: '600', color: '#F35757' }}>{trans[locate].effective_for} 15 {trans[locate].minute}</span>
                <div className="mt-0 w-100 " style={{maxWidth: 350}}>
                    <input
                        onChange={e => setCodeVerification(e.target.value)}
                        value={codeVerification}
                        className={`auth-page--form-input-register w-100 ${errorsMessage['code'] && 'error'}`}
                        type="text"
                        placeholder={trans[locate].enter_verification_code}
                    />
                    {errorValidate['code'] && <h6 className="auth-page--input-message-error">
                        {errorValidate['code']}
                        </h6>}
                </div>

                <div className="d-flex align-items-center mt-2 w-100" style={{maxWidth: 350}}>
                    <a onClick={resendCode} role="button" style={{ textDecoration: "underline", marginTop: 5, display: "block" }}>{trans[locate].resend_verification_code}</a>
                    {resendLoading && (
                        <div className="ms-2">
                            <CircleSpinner color="#E9B261" size={15} />
                        </div>
                    )}

                </div>

                <div className="mt-4 w-100">
                    <RegBtnSubmit type="next" title={trans[locate].next} loading={submitLoading} />
                </div>
            </form>
        </div>
    )
}