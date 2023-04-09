import { useEffect, useState } from "react";
import { CircleSpinner } from "react-spinners-kit";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import { alertActions, authActions } from "@store/actions";
import PageLayout from "@layouts/page";
import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { routeNames } from "@utils/router";
import { trans } from "src/resources/trans";
import AuthLayout from '@layouts/auth'
import SliderCaptchaBox from "@components/slider_captcha";

export default function LoginPage() {
    const dispatch = useDispatch()
    const router = useRouter()
    const { locate } = useSelector(locateSelector)


    const { loadingLogin } = useSelector(authSelector)

    const [phoneNumber, setPhoneNumber] = useState('')
    const [password, setPassword] = useState('')
    const [captchaToken, setCaptchaToken] = useState('')
    const [captchaWarning, setCaptchaWarning] = useState(false)

    const login = (e: any) => {
        e.preventDefault();
        setCaptchaWarning(false)

        if (!captchaToken) {
            setCaptchaWarning(true)
            return 
        }

        dispatch(authActions.login({
            phoneNumber, password,
            locate,
            captchaToken
        }))
    }

    useEffect(() => {
        document.body.style['zoom'] = "90%";
    }, [])

    return (
        <PageLayout empty >
            <AuthLayout step={1} stepHasBack={[1]} onBack={() => router.back()}>
                <a onClick={() => router.push(routeNames.home)} role="button" style={{
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

                <form onSubmit={login} className="auth-page--form">
                    <h3 className="auth-page--form-title text-center text-uppercase">
                        {trans[locate].welcome_retx}
                    </h3>

                    <input onChange={e => setPhoneNumber(e.target.value)} type="text" className="auth-page--form-input" placeholder={trans[locate].phone_number + "/ " + trans[locate].email} />
                    <input onChange={e => setPassword(e.target.value)} type="password" className="auth-page--form-input mb-0" placeholder={trans[locate].password} />

                    <div className="mt-2 d-flex justify-content-end mb-2">
                        <a href={routeNames.forgotPassword} className="a-none" style={{ color: '#555555' }} >{trans[locate].forgot_password}</a>
                    </div>

                    <SliderCaptchaBox
                        onVerifySuccess={(token) => {
                            setCaptchaToken(token)
                            setCaptchaWarning(false)
                        }}
                        warning={captchaWarning}
                    />

                    <button type="submit" className="btn-primary-light border-0 mx-auto d-flex justify-content-center align-items-center mt-3 w-100">
                        {loadingLogin ? (
                            <CircleSpinner size={25} />
                        ) : (
                            <span style={{ textTransform: 'uppercase', color: "#434343", fontSize: '1.1rem', fontWeight: '600' }}>{trans[locate].login}</span>
                        )}
                    </button>

                    <div className="mt-5">
                        <h6 style={{ color: '#555555', textAlign: 'center' }}> {trans[locate].do_not_have_an_account_yet}?</h6>
                        <button type="button" onClick={() => router.push(routeNames.register)} className="mt-3 text-white button btn-primary-dark w-100" style={{ backgroundColor: '#ACACAC', fontSize: '1.1rem', fontWeight: '600', textTransform: 'uppercase', }} >
                            {trans[locate].register}
                        </button>
                    </div>

                </form>
            </AuthLayout>
        </PageLayout>
    )
}