import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import { alertActions, authActions } from "@store/actions";
import PageLayout from "@layouts/page";
import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { routeNames } from "@utils/router";
import AuthLayout from '@layouts/auth'
import ForgotPassStep1 from "@components/forgot_password/step_1";
import ForgotPasswordStep2 from "@components/forgot_password/step_2";
import ForgotPassStep3 from "@components/forgot_password/step_3";
import ForgotPassStep4 from "@components/forgot_password/step_4";

export default function ForgetPassowrdPage() {
    const dispatch = useDispatch()
    const router = useRouter()
    const { locate } = useSelector(locateSelector)
    const { forgotStep } = useSelector(authSelector)

    return (
        <PageLayout empty >
            <AuthLayout step={forgotStep} stepHasBack={[1, 2]} onBack={() => {
                if (forgotStep == 1) router.push(routeNames.home)
                else dispatch(authActions.backForgotStep())
            }}>

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

                {forgotStep == 1 && <ForgotPassStep1 />}
                {forgotStep == 2 && <ForgotPasswordStep2 />}
                {forgotStep == 3 && <ForgotPassStep3 />}
                {forgotStep == 4 && <ForgotPassStep4 />}
            </AuthLayout>
        </PageLayout>
    )
}