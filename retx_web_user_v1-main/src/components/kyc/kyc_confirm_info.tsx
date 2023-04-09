import router from "next/router";
import Resizer from "react-image-file-resizer";
import { useDispatch, useSelector } from "react-redux";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import { authActions } from "@store/actions";
import { userApi } from "@apis/index";
import ModalBase from "@components/modal";
import RegBtnSubmit from "@components/register/btn_submit";
import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { routeNames } from "@utils/router";
import { UserUpdateKycDTO } from "src/models/user/user.model";
import { trans } from "src/resources/trans";


export default function KycConfirmInfo() {
    const dispatch = useDispatch()

    const {idCardVerify, user, idCardFrontFile, idCardBackFile} = useSelector(authSelector)
    const {locate} = useSelector(locateSelector)

    const [imageAvatar, setImageAvatar] = useState<string>()
    const [avatarFile, setAvatarFile] = useState<File>()
    const [loadingUpdate, setLoadingUpdate] = useState(false)
    const refInputAvatar = useRef<HTMLInputElement>()
    const [password, setPassword] = useState('')
    const [modalVerifyPassword, setModalVerifyPassword] = useState(false)
    const [msgErrros, setMsgErrros] = useState({})

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

    const onChangeAvatar = async (e: ChangeEvent<HTMLInputElement>)=>{
        let file = e.target.files[0]
        file = await resizeFile(e.target.files[0])
        // console.log("image size: ", file.size)

        const reader = new FileReader();

        reader.addEventListener("load", function () {
            setImageAvatar(reader.result.toString())
            setAvatarFile(file)
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }
    }

    const onChangeIdCardFront = (fieldname: 'name' | 'id' | 'address') => (value: any) => {
        let temp = {...idCardVerify};
        temp.front[fieldname] = value;
        // setIdCardFront(temp)
        dispatch(authActions.updateIdCard(temp))

    }

    useEffect(() => {
        console.log(user)
    }, [])

    const updateKyc = async ()=>{
        setLoadingUpdate(true)
        try{
            let response = await userApi.updateKYC(new UserUpdateKycDTO({
                userId: user.id,
                fullname: idCardVerify?.front?.name,
                gender: idCardVerify?.front?.sex,
                dateOfBirth: idCardVerify?.front?.dob,
                password,
                avatarFile,
                frontOfIdCardFile: idCardFrontFile,
                backOfIdCardFile: idCardBackFile,
                idCardInfo: JSON.stringify(idCardVerify)
            }))
            console.log("🚀 ~ file: kyc_confirm_info.tsx:89 ~ updateKyc ~ response", response)
            if (!!response?.user)
            dispatch(authActions.updateKYCSuccess(response.user))
            setMsgErrros({})
            setModalVerifyPassword(false)
            dispatch(authActions.nextKycStep())
            setPassword("")
            // console.log(response)
            // router.push(routeNames.home)
        }
        catch(err){
            console.log(err)
            err?.message && setMsgErrros({...msgErrros, password: err?.message})
        }
        setLoadingUpdate(false)

    }


    const closeModalConfirmPass = ()=>{
        setModalVerifyPassword(false)
        setMsgErrros({})
        setPassword("")
    }

    return (
        <>
            <ModalBase visible={modalVerifyPassword} onCancel={() => {closeModalConfirmPass()}}>
                <div className="bg-white p-5 auth-page flex-column justify-content-start" style={{ minHeight: 300 }}>
                    <a onClick={() => closeModalConfirmPass()} role="button" style={{
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


                    <h5 className="text-center">
                        <pre>{trans[locate].enter_password_to_complete_verification_process}</pre>
                    </h5>

                    <input onChange={e => setPassword(e.target.value)} style={{maxWidth: 350}} type="password" value={password} className="auth-page--form-input-register mt-3" placeholder={trans[locate].password} />
                    
                    <div style={{maxWidth: 350, width: '100%'}}>
                        {msgErrros['password'] && <h6 className="auth-page--input-message-error">{msgErrros['password']}</h6> }                      
                    </div>

                    <div className="mt-3 w-100" style={{maxWidth: 350}}>
                        <RegBtnSubmit onClick={updateKyc} type="next" title={trans[locate].confirm} style={{ width: '100%' }} loading={loadingUpdate} />
                    </div>

                </div>
            </ModalBase>

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

            <h5 className="mt-4 text-center">
                <pre className="d-xl-block d-none" >{trans[locate].check_information_to_complete}</pre>
                <span className="d-xl-none d-block" >{trans[locate].check_information_to_complete}</span>
            </h5>
            <div className="kyc-content mt-2">
                <div className="row mt-3 w-100">
                    <div className="col-xl-6 d-flex flex-column justify-content-center align-items-center">
                        <a onClick={() => refInputAvatar.current.click()} role="button" className="input-card input-image-avatar" style={{...imageAvatar&&{border: 0}}}>
                            <span style={{ fontSize: '4rem', color: '#9f9f9f' }}>
                                <i className="fa-light fa-circle-user"></i>
                            </span>
                            {imageAvatar && (
                                <div className="img-card"
                                    style={{
                                        backgroundImage: `url(${imageAvatar})`,
                                        backgroundPosition: 'center',
                                        backgroundSize: 'cover',
                                    }}
                                >
                                    
                                </div>
                            )}
                            
                        </a>
                       {imageAvatar && (
                            <button onClick={() => {
                                refInputAvatar.current.value = null
                                setImageAvatar('')
                            }} className="button mt-2" style={{ color: 'red', border: '1px solid red', padding: '2px 5px', borderRadius: 5, fontSize: 13 }}>
                                {trans[locate].remove_image}
                            </button>
                       )}

                        <h6 className="text-center mt-2">
                            {trans[locate].upload_avatar}
                        </h6>
                        <input ref={refInputAvatar} onChange={onChangeAvatar} type="file" style={{display: 'none'}} />
                    </div>
                    <div className="col-xl-6" >
                       <div>
                       <div className=" d-flex flex-column">
                            <label style={{ color: '#4A4A4A' }} >{trans[locate].fullname}</label>
                            <input onChange={e => onChangeIdCardFront('name')(e.target.value)} className="auth-page--form-input-register w-100" type="text"  value={idCardVerify.front.name} />
                        </div>
                        <div className="mt-3 d-flex flex-column">
                            <label style={{ color: '#4A4A4A' }} >{trans[locate].phone_number}</label>
                            <input className="auth-page--form-input-register w-100" type="text" disabled  value={user.phoneNumber}/>
                        </div>
                        <div className="mt-3 d-flex flex-column">
                            <label style={{ color: '#4A4A4A' }} >{trans[locate].email}</label>
                            <input className="auth-page--form-input-register w-100" type="email" disabled value={user.email} />
                            {/* <h6 className="auth-page--input-message-error">Error message</h6> */}
                        </div>
                        <div className="mt-3 d-flex flex-column">
                            <label style={{ color: '#4A4A4A' }} >{trans[locate].id_card}</label>
                            <input onChange={e => onChangeIdCardFront('id')(e.target.value)} className="auth-page--form-input-register w-100" type="text"  value={idCardVerify.front.id} />
                        </div>
                        <div className="mt-3 d-flex flex-column">
                            <label style={{ color: '#4A4A4A' }} >{trans[locate].address}</label>
                            <input onChange={e => onChangeIdCardFront('address')(e.target.value)} className="auth-page--form-input-register w-100" type="text"  value={idCardVerify.front.address} />
                        </div>
                        <div className="mt-3 w-100 d-flex flex-column">
                            <RegBtnSubmit onClick={()=> setModalVerifyPassword(true)} type="next" title={trans[locate].next} style={{ width: '100%' }}  />
                        </div>
                       </div>
                    </div>
                </div>

            </div>
        </>
    )
}