import { ChangeEvent, useEffect, useState } from "react"
import { CircleSpinner } from "react-spinners-kit"
import { useDispatch, useSelector } from "react-redux"
import Resizer from "react-image-file-resizer";


import { alertActions, authActions } from "@store/actions"
import { authApi, userApi } from "@apis/index"
import ModalBase from "@components/modal"
import { authSelector } from "@store/auth/auth.slice"
import { locateSelector } from "@store/locate/locate.slice"
import { isEmail } from "@utils/functions"
import { trans } from "src/resources/trans"
import dynamic from "next/dynamic"
import { routeNames } from "@utils/router";


const DynamicProfileUploadAvatar = dynamic(
    () => import('@components/profile/upload_avatar'),
    { ssr: false }
)



export default function ProfileInfo() {
    const dispatch = useDispatch()
    const { user } = useSelector(authSelector)
    const { locate } = useSelector(locateSelector)

    const [sendCodeLoading, setSendCodeLoading] = useState(true)
    const [verifyLoading, setVerifyLoading] = useState(false)
    const [resendCodeLoading, setResendCodeLoading] = useState(false)
    const [showUIConfirmCode, setShowUIConfirmCode] = useState(false)
    const [newEmail, setNewEmail] = useState('')
    const [emailCode, setEmailCode] = useState('')
    const [dataEncode, setDataEncode] = useState('')
    const [openModalUpdateEmail, setOpenModalUpdateEmail] = useState(false)
    const [errorsValidate, setErrorsValidate] = useState({})


    const requetUpdateEmail = async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSendCodeLoading(true)

        try {
            await authApi.otpSend({
                type: 'email',
                userId: user.id,
                scenario: 'change_user_email',
                details: {
                    email: newEmail
                }
            })
            setShowUIConfirmCode(true)
            setSendCodeLoading(false)
        }
        catch (e) {
            console.log(e)
            if (!!e.message)
                setErrorsValidate({ email: e.message })
            setSendCodeLoading(false)
        }
        setSendCodeLoading(false)

    }

    const vefifyUpdateEmail = async () => {
        setVerifyLoading(true)
        
        setErrorsValidate({})
        try {
            let { otpToken } = await authApi.otpVerify({
                type: 'email',
                userId: user.id,
                otpCode: emailCode,
                scenario: 'change_user_email'
            })
            await userApi.updateEmail({
                otpToken: otpTokenEmailOld,
                confirmEmailOtpToken: otpToken,
                email: newEmail
            })
            dispatch(authActions.self.updateUser({ ...user, email: newEmail }))
            setOpenModalUpdateEmail(false)
            dispatch(alertActions.alertSuccess(trans[locate].update_email_successfully))
            setErrorsValidate({})

        }
        catch (e) {
            console.log(e)
            e?.message && setErrorsValidate({code: e.message})
            
        }
        setVerifyLoading(false)
    }

    const resendCodeEmail = async () => {
        setResendCodeLoading(true)
        try {
            let res = await authApi.otpSend({
                type: 'email',
                scenario: 'change_user_email',
                userId: user.id,
                ...newEmail ? {details: {email: newEmail}} : {}
            })
            dispatch(alertActions.alertSuccess(trans[locate].resend_verification_code_to_your_email_successfully))
        }
        catch (e) {
            console.log(e)
        }
        setResendCodeLoading(false)
    }

    useEffect(() => {
        if (openModalUpdateEmail == false) {
            clear()
        }
    }, [openModalUpdateEmail])


    const closeModalUpdateEmail = () => {
        setOpenModalUpdateEmail(false);
        setErrorsValidate({})
    }


    const [openModalVerifyEmail, setOpenModalVerifyEmail] = useState(false)
    const [loadingVerifyEmail, setLoadingVerifyEmail] = useState(false)
    const [loadingSendCode, setLoadingSendCode] = useState(true)

    const showModalVerifyEmail = async (again?:boolean) => {
        setOpenModalVerifyEmail(true)
        setLoadingSendCode(true)

        try {
            let res = await authApi.otpSend({
                type: 'email',
                userId: user.id,
                scenario: 'verify_email'
            })
            setLoadingSendCode(false)
            dispatch(alertActions.alertSuccess(trans[locate].resend_OTP_successfully))

        }
        catch (e) {
            console.log(e)
        }
    }

    const closeModalVerifyMyEmail = () => {
        setOpenModalVerifyEmail(false)
        clear()
    }

    const clear = () => {
        setVerifyLoading(false)
        setSendCodeLoading(false)
        setShowUIConfirmCode(true)
        setShowUIConfirmCode(false)
        setEmailCode('')
        setNewEmail('')
        setLoadingSendCode(false)
        setErrorsValidate({})
        setPhoneCode('')
        setNewPhoneNumber('')
        setLoadingVerifyPhone(false)
    }

    const [otpTokenEmailOld, setOtpTokenEmailOld] = useState('')

    const verifyMyEmail = async (e: ChangeEvent<HTMLFormElement>) => {
        e?.preventDefault();
        setLoadingVerifyEmail(true)
        setErrorsValidate({})

        try {
            let { otpToken } = await authApi.otpVerify({
                type: 'email',
                userId: user.id,
                otpCode: emailCode,
                scenario: 'verify_email'
            })
            setOtpTokenEmailOld(otpToken)
            setOpenModalUpdateEmail(true)
            closeModalVerifyMyEmail()
            setErrorsValidate({})
        }
        catch (e) {
            console.log(e)
            e?.message && setErrorsValidate({code: e?.message})
        }
        setLoadingVerifyEmail(false)
    }

    useEffect(() => {
        let temp = { ...errorsValidate }
        delete temp['code']
        setErrorsValidate(temp)
    }, [emailCode])


    const [openModalVerifyPhone, setopenModalVerifyPhone] = useState(false)
    const [openModalUpdatePhone, setOpenModalUpdatePhone] = useState(false)
    const [sendingCodeVerifyPhone, setSendingCodeVerifyPhone] = useState(false)
    const [loadingVerifyPhone, setLoadingVerifyPhone] = useState(false)
    const [phoneCode, setPhoneCode] = useState('')
    const [openModalUploadAvatar, setOpenModalUploadAvatar] = useState(false)
    const [avatarCroppedPreview, setAvatarCroppedPreview] = useState("")
    const [uploadingAvatar, setUploadingAvatar] = useState(false)


    const requestVerifyPhone = async (again?: boolean) => {
        setSendingCodeVerifyPhone(true)
        setopenModalVerifyPhone(true)
        try {
            await authApi.otpSend({
                type: 'sms',
                userId: user.id,
                scenario: 'verify_user_phone_number'
            })
            
            again && dispatch(alertActions.alertSuccess(trans[locate].resend_OTP_successfully))
        }
        catch (e) {
            console.log(e)
        }
        setSendingCodeVerifyPhone(false)
    }

    const closeModalVerifyPhone = () => {
        setopenModalVerifyPhone(false)
        setSendCodeLoading(false)
        clear()
    }

    const closeModalUpdatePhone = () => {
        setOpenModalUpdatePhone(false)
        setSendCodeLoading(false)
        clear()
    }

    const [otpTokenPhoneOld, setOtpTokenPhoneOld] = useState('')
    const verifyPhone = async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoadingVerifyPhone(true)

        setErrorsValidate({})
        try {
            let { otpToken } = await authApi.otpVerify({
                type: 'sms',
                userId: user.id,
                otpCode: phoneCode,
                scenario:'verify_user_phone_number'
            })
            setOtpTokenPhoneOld(otpToken)
            closeModalVerifyPhone()
            setOpenModalUpdatePhone(true)
            setErrorsValidate({})
        }
        catch (e) {
            console.log(e)
            e?.message && setErrorsValidate({code: e.message})
            
        }
        setLoadingVerifyPhone(false)

    }

    const [newPhoneNumber, setNewPhoneNumber] = useState('')

    const requestUpdateNewPhone = async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorsValidate({})
        setSendingCodeVerifyPhone(true)

        try {
            // await userApi.validatePhoneNumber({
            //     userId: user?.id,
            //     phoneNumber: newPhoneNumber
            // })

            await authApi.otpSend({
                type: 'sms',
                userId: user.id,
                scenario: 'change_user_phone_number',
                details: {
                    phoneNumber: newPhoneNumber
                }
            })
            setShowUIConfirmCode(true)
            setPhoneCode("")
        }
        catch (e) {
            e?.message && setErrorsValidate({phoneNumber: e.message})

        }
        finally {
            setSendingCodeVerifyPhone(false)
        }
    }

    const requestUpdateNewPhoneAgain = async () => {
        setResendCodeLoading(true)
        try {
            await authApi.otpSend({
                type: 'sms',
                userId: user.id,
                scenario: 'change_user_phone_number',
                details: {
                    phoneNumber: newPhoneNumber
                }
            })
            dispatch(alertActions.alertSuccess(trans[locate].resend_OTP_successfully))
            setPhoneCode("")
        }
        catch (e) {
            e?.message && setErrorsValidate({code: e?.message})
        }
        setResendCodeLoading(false)
    }

    const updatePhoneNumber = async () => {
        setVerifyLoading(true)
        try {
            let { otpToken } = await authApi.otpVerify({
                type: 'sms',
                userId: user.id,
                otpCode: phoneCode,
                scenario: 'change_user_phone_number'
            })
            await userApi.updatePhoneNumber({
                otpToken: otpTokenPhoneOld,
                confirmSmsOtpToken: otpToken,
                phoneNumber: newPhoneNumber
            })
            closeModalUpdatePhone()
            dispatch(authActions.self.updateUser({ ...user, phoneNumber: newPhoneNumber }))
            dispatch(alertActions.alertSuccess(trans[locate].update_phone_successfully))

        }
        catch (e) {
            console.log(e)
            if (e?.errors) {
                setErrorsValidate(e?.errors)
            }
        }
        finally {
            setVerifyLoading(false)
        }
    }

    useEffect(() => {
        if (!uploadingAvatar) {
            setOpenModalUploadAvatar(false)
        }
    }, [uploadingAvatar])

    const removeAvatar = async () => {
        try {
            let res = await userApi.removeAvatar()
            dispatch(authActions.self.updateUser({ ...user, ...res.user }))
        }
        catch (err) {
            console.log(err)
        }
    }

    const resizeFile = (file: File): Promise<File> =>
        new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,
                500,
                500,
                "JPEG",
                90,
                0,
                (uri: File) => {
                    resolve(uri);
                },
                "file"
            );
        });
    const croppedAvatar = async (file: any) => {
        let imgFile = blobToFile(file, "avatar");
        var reader = new FileReader();
        reader.readAsDataURL(imgFile);
        reader.onload = function () {
            setAvatarCroppedPreview(reader.result as string);
        };

        setUploadingAvatar(true)
        try {
            let res = await userApi.uploadAvatar(await resizeFile(imgFile))
            dispatch(authActions.self.updateUser({ ...user, ...res.user }))
        }
        catch (err) {
            console.log(err)
        }
        setUploadingAvatar(false)

    }

    const blobToFile = (theBlob: Blob, fileName: string): File => {
        return new File([theBlob], fileName, { lastModified: new Date().getTime(), type: theBlob.type })
    }

    const renderField = (value: string)=>{
        if (!user.hasUploadedKyc || user.kycStatus == "reject"){
            return trans[locate].identity_verification_to_set_up
        }
        else if (user.kycStatus == 'pending'&& !!user.hasUploadedKyc){
            return trans[locate].awaiting_identity_verification
        }
        else if (user.kycStatus == 'verified'){
            return value
        }
    }

    const isNoDataField = ()=>{
        if (!user.hasUploadedKyc || user.kycStatus == "reject"){
            return true
        }
        else if (user.kycStatus == 'pending'&& !!user.hasUploadedKyc){
            return true
        }
        else if (user.kycStatus == 'verified'){
            return false
        }
    }


    return (
        <div>

            <ModalBase visible={openModalUploadAvatar} onCancel={() => { setOpenModalUploadAvatar(false) }}  >
                <div className="profile-modal"
                    style={{
                    }}
                >
                    <div className="header">
                        <h4 className="title m-0" >
                            {trans[locate].update_avatar}
                        </h4>
                        <button onClick={() => setOpenModalUploadAvatar(false)} className="button profile-modal--btn-close">
                            <i className="fa-solid fa-xmark-large"></i>
                        </button>
                    </div>
                    <div className="content profile-modal--avatar">
                        <div className="image">
                            <div style={{ backgroundColor: '#0000', width: '250px', height: '250px', margin: 'auto', border: '1px solid #cacaca' }}>
                                {
                                    uploadingAvatar ? (
                                        <div className="d-flex justify-content-center align-items-center h-100 w-100">
                                            <CircleSpinner color="#fec128" />
                                        </div>
                                    ) : (
                                        <DynamicProfileUploadAvatar apply={croppedAvatar} text={trans[locate].upload_image} maxsize={1024 * 1024 * 7} />
                                    )
                                }
                            </div>
                        </div>

                    </div>
                </div>
            </ModalBase>

            <ModalBase visible={openModalVerifyEmail} onCancel={() => { closeModalVerifyMyEmail() }} >
                <div className="profile-modal"
                    style={{
                    }}
                >
                    <div className="header">
                        <h4 className="title m-0" >
                            {trans[locate].validate_current_email}
                        </h4>
                        <button onClick={() => closeModalVerifyMyEmail()} className="button profile-modal--btn-close">
                            <i className="fa-solid fa-xmark-large"></i>
                        </button>
                    </div>
                    <div className="content profile-content--info">
                        {
                            loadingSendCode ? (
                                <h5 className="d-flex align-items-center gap-3" >
                                    <CircleSpinner color="#fec128" size={18} loading={loadingSendCode} />
                                    {trans[locate].sending_verification_code_to}
                                    {" " + user.email.slice(0, 3)}***{user.email.slice(user.email.indexOf("@"))}
                                </h5>
                            ) : (
                                <form onSubmit={verifyMyEmail} >
                                    <h6 className="text-center">{trans[locate].your_verification_code_is_sent_by_email_to} {user.email.slice(0, 3)}***{user.email.slice(user.email.indexOf("@"))}</h6>
                                    <div className="info--field">
                                        <label className="d-flex justify-content-between" >
                                            <div>
                                                {trans[locate].code_verification}<span className="text-danger"> ({trans[locate].expires_in} 15{trans[locate].minute})</span>
                                            </div>
                                            <a onClick={()=>showModalVerifyEmail(true)} role="button"
                                                className="d-flex align-items-center gap-2"
                                                style={{
                                                    fontWeight: 600,
                                                    fontSize: 16,
                                                    textDecoration: "underline",
                                                    color: "#111"
                                                }}
                                            >
                                                {trans[locate].resend_verification_code} {resendCodeLoading && <CircleSpinner size={18} color={"#fec128"} />}
                                            </a>
                                        </label>
                                        <input disabled={showUIConfirmCode} type="text" value={emailCode} onChange={e => { setEmailCode(e.target.value) }} />
                                        {errorsValidate['code'] && <h6 style={{ fontSize: 16 }} className="auth-page--input-message-error">
                                            {errorsValidate['code']}
                                        </h6>}
                                    </div>
                                    <button className="button profile-content--btn-submit gap-2 fw-bold">
                                        <span className="text-capitalize" >{trans[locate].confirm}</span>
                                        <CircleSpinner size={18} loading={sendCodeLoading} />
                                    </button>
                                </form>
                            )
                        }
                    </div>

                </div>
            </ModalBase>

            <ModalBase visible={openModalUpdateEmail} onCancel={() => { closeModalUpdateEmail() }}  >
                <div className="profile-modal"
                    style={{
                    }}
                >
                    <div className="header">
                        <h4 className="title m-0" >
                            {trans[locate].update_new_email}
                        </h4>
                        <button onClick={() => closeModalUpdateEmail()} className="button profile-modal--btn-close">
                            <i className="fa-solid fa-xmark-large"></i>
                        </button>
                    </div>
                    <div className="content profile-content--info">
                        <form onSubmit={requetUpdateEmail}>
                            <div className="info--field">
                                <label >{trans[locate].new_email}</label>
                                <input type="text" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                                {errorsValidate['email'] && <h6 style={{ fontSize: 16 }} className="auth-page--input-message-error">
                                    {errorsValidate['email']}
                                    </h6>}
                            </div>

                            {!showUIConfirmCode && (
                                <button disabled={!newEmail} className="button profile-content--btn-submit gap-2 fw-bold">
                                    <span>{trans[locate].send_code_verification}</span>
                                    {sendCodeLoading && (
                                        <CircleSpinner size={18} />
                                    )}
                                </button>
                            )}
                        </form>

                        {showUIConfirmCode && (
                            <>
                                <div className="info--field mt-3">
                                    <div className="d-flex justify-content-between align-items-center w-100">
                                        <label >{trans[locate].code_verification} <span className="text-danger">({trans[locate].expires_in} 15{trans[locate].minute})</span> </label>
                                        <a onClick={resendCodeEmail} role="button"
                                            className="d-flex align-items-center gap-2"
                                            style={{
                                                fontWeight: 600,
                                                fontSize: 16,
                                                textDecoration: "underline",
                                                color: "#111"
                                            }}
                                        >
                                            {trans[locate].resend_verification_code} {resendCodeLoading && <CircleSpinner size={18} color={"#fec128"} />}
                                        </a>
                                    </div>
                                    <div className="input-group">
                                        <input type="text" value={emailCode} onChange={e => setEmailCode(e.target.value)} />
                                    </div>
                                    {errorsValidate['code'] && <h6 className="auth-page--input-message-error">
                                        {errorsValidate['code']}
                                        </h6>}

                                </div>

                                <button onClick={vefifyUpdateEmail} className="button profile-content--btn-submit gap-2 fw-bold text-capitalize ">
                                    <span>{trans[locate].confirm}</span>
                                    {verifyLoading && <CircleSpinner size={18} />}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </ModalBase>

            <ModalBase visible={openModalVerifyPhone} onCancel={() => { closeModalVerifyPhone() }} >
                <div className="profile-modal"
                    style={{
                    }}
                >
                    <div className="header">
                        <h4 className="title m-0" >
                            {trans[locate].validate_current_phone}
                        </h4>
                        <button onClick={() => closeModalVerifyPhone()} className="button profile-modal--btn-close">
                            <i className="fa-solid fa-xmark-large"></i>
                        </button>
                    </div>
                    <div className="content profile-content--info">
                        {
                            sendingCodeVerifyPhone ? (
                                <h5 className="d-flex align-items-center gap-3" >
                                    <CircleSpinner color="#fec128" size={18} loading={sendingCodeVerifyPhone} />
                                    {trans[locate].sending_verification_code_to}
                                    {" " + user.phoneNumber.slice(0, 4)}***{user.phoneNumber.slice(-4)}
                                </h5>
                            ) : (
                                <form onSubmit={verifyPhone} >
                                    <h6 className="text-center">
                                        {trans[locate].your_verification_code_is_sent_to_phone_number} {" " + user.phoneNumber.slice(0, 4)}***{user.phoneNumber.slice(-4)}
                                    </h6>
                                    <div className="info--field">
                                        <label className="d-flex justify-content-between" >
                                            <div>
                                                {trans[locate].code_verification}<span className="text-danger"> ({trans[locate].expires_in} 15{trans[locate].minute})</span>
                                            </div>
                                            <a onClick={() => requestVerifyPhone(true)} role="button"
                                                className="d-flex align-items-center gap-2"
                                                style={{
                                                    fontWeight: 600,
                                                    fontSize: 16,
                                                    textDecoration: "underline",
                                                    color: "#111"
                                                }}
                                            >
                                                {trans[locate].resend_verification_code} {resendCodeLoading && <CircleSpinner size={18} color={"#fec128"} />}
                                            </a>
                                        </label>
                                        <input disabled={showUIConfirmCode} type="text" value={phoneCode} onChange={e => { setPhoneCode(e.target.value) }} />
                                        {errorsValidate?.['code'] && <h6 style={{ fontSize: 16 }} className="auth-page--input-message-error">
                                            {errorsValidate['code']}
                                        </h6>}
                                    </div>
                                    <button className="button profile-content--btn-submit gap-2 fw-bold">
                                        <span className="text-capitalize" >{trans[locate].confirm}</span>
                                        <CircleSpinner size={18} loading={loadingVerifyPhone} />
                                    </button>
                                </form>
                            )
                        }
                    </div>

                </div>
            </ModalBase>

            <ModalBase visible={openModalUpdatePhone} onCancel={() => { closeModalUpdatePhone() }}  >
                <div className="profile-modal"
                    style={{
                    }}
                >
                    <div className="header">
                        <h4 className="title m-0" >
                            {trans[locate].update_new_phone}
                        </h4>
                        <button onClick={() => closeModalUpdatePhone()} className="button profile-modal--btn-close">
                            <i className="fa-solid fa-xmark-large"></i>
                        </button>
                    </div>
                    <div className="content profile-content--info">
                        <form onSubmit={requestUpdateNewPhone}>
                            <div className="info--field">
                                <label >
                                    {trans[locate].new_phone}
                                </label>
                                <input type="text" value={newPhoneNumber} onChange={e => setNewPhoneNumber(e.target.value)} />
                                {errorsValidate['phoneNumber'] && <h6 style={{ fontSize: 16 }} className="auth-page--input-message-error">
                                    {errorsValidate['phoneNumber']}
                                </h6>}
                            </div>

                            {!showUIConfirmCode && (
                                <button disabled={!newPhoneNumber} className="button profile-content--btn-submit gap-2 fw-bold">
                                    <span>{trans[locate].send_code_verification}</span>
                                    {sendingCodeVerifyPhone && (
                                        <CircleSpinner size={18} />
                                    )}
                                </button>
                            )}
                        </form>

                        {showUIConfirmCode && (
                            <>
                                <div className="info--field mt-3">
                                    <div className="d-flex justify-content-between align-items-center w-100">
                                        <label >{trans[locate].code_verification} <span className="text-danger">({trans[locate].expires_in} 15{trans[locate].minute})</span> </label>
                                        <a onClick={requestUpdateNewPhoneAgain} role="button"
                                            className="d-flex align-items-center gap-2"
                                            style={{
                                                fontWeight: 600,
                                                fontSize: 16,
                                                textDecoration: "underline",
                                                color: "#111"
                                            }}
                                        >
                                            {trans[locate].resend_verification_code} {resendCodeLoading && <CircleSpinner size={18} color={"#fec128"} />}
                                        </a>
                                    </div>
                                    <div className="input-group">
                                        <input type="text" value={phoneCode} onChange={e => setPhoneCode(e.target.value)} />
                                    </div>
                                    {errorsValidate['code'] && <h6 className="auth-page--input-message-error">
                                        {errorsValidate['code']}
                                        </h6>}


                                </div>

                                <button onClick={updatePhoneNumber} className="button profile-content--btn-submit gap-2 fw-bold text-capitalize ">
                                    <span>{trans[locate].confirm}</span>
                                    {verifyLoading && <CircleSpinner size={18} />}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </ModalBase>

            <div className="profile-content--info">

                <h5 className="mb-4">
                    {trans[locate].avatar}
                </h5>
                <div className="profile-avatar">
                    <img style={{ aspectRatio: '1/1', objectFit: 'cover' }} src={user?.avatarUrl || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'} alt="" />
                    <div className="profile-avatar--menu gap-3">
                        <a onClick={() => { setOpenModalUploadAvatar(true) }} role="button">
                            <i className="fa-regular fa-image"></i>
                        </a>
                        {user?.avatarUrl && (
                            <a onClick={() => removeAvatar()} role="button">
                                <i className="fa-regular fa-trash-can"></i>
                            </a>
                        )}
                    </div>
                </div>

                <div>
                    <h5 className="mb-4">
                        {trans[locate].basic_information}
                    </h5>
                    <div className="profile-content--list-field">
                        <div className="profile-content--item-field">
                            <div className="text">
                                <span className="label">
                                    {trans[locate].name}
                                </span>
                                <span className="value">
                                    {user?.name}
                                </span>
                            </div>
                        </div>
                        <div className="profile-content--item-field">
                            <div className="text">
                                <span className="label">
                                    {trans[locate].email}
                                </span>
                                <span className="value">
                                    {`${user.email.slice(0, 3)}***${user.email.slice(user.email.indexOf("@"))}`}
                                </span>
                            </div>
                            <div className="action">
                                <a onClick={() => showModalVerifyEmail(false)} role="button" >
                                    <i className="fa-regular fa-pen-to-square"></i>
                                </a>
                            </div>
                        </div>
                        <div className="profile-content--item-field">
                            <div className="text">
                                <span className="label">
                                    {trans[locate].phone_number}
                                </span>
                                <span className="value">
                                    {user?.phoneNumber.slice(0, 4) + "***" + user?.phoneNumber?.slice(-4)}
                                </span>
                            </div>
                            <div className="action">
                                <a onClick={() => requestVerifyPhone()} role="button" >
                                    <i className="fa-regular fa-pen-to-square"></i>
                                </a>
                            </div>
                        </div>
                        <div className="profile-content--item-field">
                            <div className="text">
                                <span className="label">
                                    {trans[locate].birthday}
                                </span>
                                <span className={`value ${isNoDataField() && 'no-data'}`}>
                                    {renderField(user?.dateOfBirth)}
                                </span>
                            </div>
                            {!user.hasUploadedKyc || user.kycStatus == "reject" ? (
                                <div className="action">
                                    <a href={routeNames.kyc}  className="d-flex gap-2" >
                                        <i className="fa-regular fa-pen-to-square"></i>
                                        <span style={{fontSize: 14}}>{trans[locate].verify_now}</span>
                                    </a>
                                </div>
                            ):null}
                        </div>
                        <div className="profile-content--item-field">
                            <div className="text">
                                <span className="label">
                                {trans[locate].address}
                                </span>
                                <span className={`value ${isNoDataField() && 'no-data'}`}>
                                {renderField(user?.address)}
                                </span>
                            </div>
                            {!user.hasUploadedKyc || user.kycStatus == "reject" ? (
                                <div className="action">
                                    <a href={routeNames.kyc}  className="d-flex gap-2" >
                                        <i className="fa-regular fa-pen-to-square"></i>
                                        <span style={{fontSize: 14}}>{trans[locate].verify_now}</span>
                                    </a>
                                </div>
                            ):null}
                        </div>
                        <div className="profile-content--item-field">
                            <div className="text">
                                <span className="label">
                                    {trans[locate].id_card}
                                </span>
                                <span className={`value ${isNoDataField() && 'no-data'}`}>
                                {renderField(user?.idCard && user?.idCard?.slice(0, 5) + "***" + user?.idCard?.slice(-3))}
                                </span>
                            </div>
                            {!user.hasUploadedKyc || user.kycStatus == "reject" ? (
                                <div className="action">
                                    <a href={routeNames.kyc}  className="d-flex gap-2" >
                                        <i className="fa-regular fa-pen-to-square"></i>
                                        <span style={{fontSize: 14}}>{trans[locate].verify_now}</span>
                                    </a>
                                </div>
                            ):null}
                        </div>
                    </div>
                </div>

                <div>
                    <h5
                        dangerouslySetInnerHTML={{ __html: trans[locate].please_contact_to_update_kyc_information.replace("091 969 6000", "<a class='fw-bold' href='tel:0919696000' style='color: #f2c338; text-decoration: underline;' >091 969 6000</a>") }}
                        className="text-center mt-5" style={{color: '#111'}} ></h5>
                </div>
            </div>
        </div>
    )
}