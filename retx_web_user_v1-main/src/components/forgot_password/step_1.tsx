import { useDispatch, useSelector } from "react-redux";
import { ChangeEvent, useState } from "react";

import { alertActions, authActions } from "@store/actions";
import { authApi, userApi } from "@apis/index";
import RegBtnSubmit from "@components/register/btn_submit";
import SliderCaptchaBox from "@components/slider_captcha";
import { locateSelector } from "@store/locate/locate.slice";
import { trans } from "src/resources/trans";


export default function ForgotPassStep1() {
    const dispatch = useDispatch()

    const { locate } = useSelector(locateSelector)
    const [captchaToken, setCaptchaToken] = useState('')
    const [captchaWarning, setCaptchaWarning] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [username, setUsername] = useState('')
    const [formErrors, setFormErrors] = useState({})

    const submit = async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        setFormErrors({})
        setCaptchaWarning(false)
        let errors = {}
        let captcha_warning = false

        if (!username) {
            errors['username'] = 'msg_error_input_require'
        }

        if (!captchaToken) captcha_warning = true;

        if (Object.keys(errors).length > 0 || captcha_warning) {
            setCaptchaWarning(true);
            setFormErrors(errors);
            return;
        }

        setLoadingSubmit(true)


        const getUserIdentity = (input: string) => {
            if (input.includes("@")) {
              return 'email';
            } else if (/^\d+$/.test(input)) {
              return 'sms'
            } else {
              return null
            }
          }

        try {
            await authApi.otpSend({
                type:getUserIdentity(username),
                scenario: 'reset_user_password',
                details: {
                    [getUserIdentity(username) == 'email' ? 'email' :'phoneNumber'] : username
                },
                captchaToken
            })
            dispatch(authActions.self.submitRequestForgotPasswordSuccess({
                email: username,
                type: getUserIdentity(username)
            }))

        }
        catch (e: any) {
            console.log(e)
            e?.message && dispatch(alertActions.alertError(e.message))
        }
        setLoadingSubmit(false)

    }


    return (
        <form onSubmit={submit} className="auth-page--form">
            <h3 className="auth-page--form-title text-center text-uppercase">
                {trans[locate].your_account}
            </h3>

            <div className=" mb-3 w-100 ">
                <input
                    onChange={e => { setUsername(e.target.value) }}
                    type="text"
                    className={`auth-page--form-input mb-0 w-100 ${formErrors['username'] && 'error'}`}
                    placeholder={trans[locate].phone_number + "/ " + trans[locate].email}
                    // placeholder={trans[locate].email}
                />
                {formErrors['username'] && <h6 className="auth-page--input-message-error">{trans[locate][formErrors['username']]}</h6>}
            </div>

            <SliderCaptchaBox
                onVerifySuccess={(token) => {
                    setCaptchaToken(token)
                    setCaptchaWarning(false)
                }}
                warning={captchaWarning}
            />

            <div className="mt-3">
                <RegBtnSubmit type="next" title={trans[locate].next} loading={loadingSubmit} />
            </div>


        </form>
    )
}