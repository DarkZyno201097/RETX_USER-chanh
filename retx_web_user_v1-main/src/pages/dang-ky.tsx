import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SwishSpinner } from "react-spinners-kit";
import { useDispatch, useSelector } from "react-redux";

import AuthLayout from "@layouts/auth";
import PageLayout from "@layouts/page";
import RegFormStep1 from "@components/register/step_1";
import RegFormStep2 from "@components/register/step_2";
import RegFormStep3 from "@components/register/step_3";
import { authSelector } from "@store/auth/auth.slice";
import RegFormStep4 from "@components/register/step_4";
import { authActions } from "@store/actions";
import RegPageMetamask from "@components/register/metamask";


export default function RegisterPage() {

    const dispatch = useDispatch()
    const router = useRouter()

  
    const {regStep, loadingAuthenticate, authenticated} = useSelector(authSelector)
    

    useEffect(() => {
        dispatch(authActions.resetStepRegister())
    }, [])

    

    useEffect(() => {
        if (!loadingAuthenticate){
         if (authenticated) router.push('/')
        }
     }, [loadingAuthenticate])

    
    if (!authenticated || regStep != 1)
    return (
        <PageLayout empty>
            <AuthLayout step={regStep} stepHasBack={[1, 2]} onBack={()=>{
                if (regStep == 1) router.back()
                else dispatch(authActions.backStepRegister())
            }}>
                
                {regStep == 1 && <RegFormStep1 />}
                {regStep == 2 && <RegFormStep2 />}
                {regStep == 3 && <RegFormStep3 />}
                {regStep == 4 && <RegPageMetamask/>}
                {regStep == 5 && <RegFormStep4 />}


            </AuthLayout>
        </PageLayout>
    )
    else return <PageLayout>
    <div className="d-flex justify-content-center align-items-center" style={{
        position: 'fixed',
        backgroundColor: '#fff',
        zIndex: true ? 999 : -1,
        width: '100%',
        height: '100%',
        top: 0,
        transition: 'all .7s',
        opacity: true ? 1 : 0
    }}>
        {true && (
            <>
                <SwishSpinner frontColor="#ffc027" size={100} />
                <div style={{
                    minHeight: '100vh'
                }} />
            </>
        )}
    </div>
</PageLayout>
}