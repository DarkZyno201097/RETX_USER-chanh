import { useEffect, useState } from "react";
import router from "next/router";
import { SwishSpinner } from "react-spinners-kit";
import { useDispatch, useSelector } from "react-redux";

import AuthLayout from "@layouts/auth";
import PageLayout from "@layouts/page";
import { authSelector } from "@store/auth/auth.slice";
import KycVerify from "@components/kyc/kyc_verify";
import KycConfirmInfo from "@components/kyc/kyc_confirm_info";
import { authActions } from "@store/actions";
import KycSuccess from "@components/kyc/kyc_success";

export default function KycPage() {
    const dispatch = useDispatch()

    const { authenticated, kycStep, user, loadingAuthenticate } = useSelector(authSelector)

    useEffect(() => {
        if (user.hasUploadedKyc && user.kycStatus == 'verified') {
            dispatch(authActions.updateKYCSuccess(user))
        }
        else {
            dispatch(authActions.resetKycStep())
        }
    }, [user.kycStatus])


    useEffect(() => {
       if (!loadingAuthenticate){
        if (!authenticated) router.push('/')
       }
    }, [loadingAuthenticate])

    if (authenticated)
        return (
            <PageLayout empty>
                <AuthLayout step={kycStep} stepHasBack={[2]} onBack={() => {
                    if (kycStep == 1 || kycStep == 3) {
                        router.back()
                    }
                    else dispatch(authActions.backKycStep())
                }}>
                    {kycStep == 1 && (<KycVerify />)}
                    {kycStep == 2 && (<KycConfirmInfo />)}
                    {kycStep == 3 && (<KycSuccess />)}
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