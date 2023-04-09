import Router from "next/router"
import { ChangeEvent, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { CircleSpinner } from "react-spinners-kit"

import { alertActions, authActions } from "@store/actions"
import { userApi } from "@apis/index"
import RegBtnSubmit from "@components/register/btn_submit"
import { locateSelector } from "@store/locate/locate.slice"
import { routeNames } from "@utils/router"
import { IdCardBack, IdCardFront } from "src/models/user/id_card.model"
import { trans } from "src/resources/trans"


export default function KycVerify() {
    const dispatch = useDispatch()

    const {locate} = useSelector(locateSelector)

    const [imageCardFront, setImageCardFront] = useState<string>()
    const [imageCardBack, setImageCardBack] = useState<string>()
    
    const [idCardFront, setIdCardFront] = useState<IdCardFront>(new IdCardFront())
    const [uploadingCardFront, setUploadingCardFront] = useState(false)
    const [idCardBack, setIdCardBack] = useState<IdCardBack>(new IdCardBack())
    const [uploadingCardBack, setUploadingCardBack] = useState(false)

    const [statusVerifyIdCard, setStatusVerifyIdCard] = useState({
        front: true,
        back: true
    })
    const [idCardFile, setIdCardFile] = useState({
        front: null,
        back: null
    })

    const refInputCardFront = useRef<HTMLInputElement>()
    const refInputCardBack = useRef<HTMLInputElement>()

    const [validateForm, setValidateForm] = useState({})
    const [nextLoading, setNextLoading] = useState(false)

    const onChangeCardFront = async (e: ChangeEvent<HTMLInputElement>)=>{
        console.log(e.target.files)
        let file = e.target.files[0]

        const reader = new FileReader();

        reader.addEventListener("load", function () {
            setImageCardFront(reader.result.toString())
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }

        setUploadingCardFront(true)
        try {
            let response = await userApi.recognizeIdCard(file);
            let cardFront = new IdCardFront(response?.[0])
            setIdCardFront(cardFront)
            setIdCardFile({
                ...idCardFile,
                front: file
            })
        }
        catch (e) {
            console.log(e)
        }
        setUploadingCardFront(false)

    }

    const onChangeCardBack = async (e: ChangeEvent<HTMLInputElement>)=>{
        let file = e.target.files[0]

        const reader = new FileReader();

        reader.addEventListener("load", function () {
            setImageCardBack(reader.result.toString())
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }

        setUploadingCardBack(true)
        try {
            let response = await userApi.recognizeIdCard(file);
            // console.log(response);
            let cardBack = new IdCardBack(response?.[0])
            setIdCardBack(cardBack)
            setIdCardFile({
                ...idCardFile,
                back: file
            })
        }
        catch (e) {
            console.log(e)
        }
        setUploadingCardBack(false)
    }

    const onChangeIdCardFront = (fieldname: 'name' | 'id' | 'sex' | 'address') => (value: any) => {
        let temp = {...idCardFront};
        temp[fieldname] = value;
        setIdCardFront(temp)

    }

    const onChangeIdCardBack = (fieldname: 'issue_date' | 'issue_loc') => (value: any) => {
        let temp = {...idCardBack};
        temp[fieldname] = value;
        setIdCardBack(temp)

    }

    const next = async ()=>{

        setNextLoading(true)

        setStatusVerifyIdCard({
            front: true,
            back: true
        })

        if (!idCardFront.id){
            setStatusVerifyIdCard({...statusVerifyIdCard, front: false})
            setNextLoading(false)
            return;
        }
        if (!idCardBack.issue_date){
            setStatusVerifyIdCard({...statusVerifyIdCard, back: false})
            setNextLoading(false)
            return;
        }

        try{
            await userApi.checkIdCard(idCardFront.id);
            console.log(idCardFile)
            dispatch(authActions.verifyIdCardSuccess({
                idCard: {
                    front: idCardFront,
                    back: idCardBack
                },
                idCardFrontFile: idCardFile.front,
                idCardBackFile: idCardFile.back
            }))
        }
        catch (err){
            console.log(JSON.stringify(err))
            if (err.message) dispatch(alertActions.alertError(err.message))
        }
        setNextLoading(false)

    }



    return (
        <>
        <a onClick={() => Router.push(routeNames.home)} role="button" style={{
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

            <h5 className="mt-4">{trans[locate].identity_verification_process}</h5>
            <div className="kyc-content mt-4">
                <h6 className="text-center" style={{ color: '#DDA500' }}>{trans[locate].please_take_pictures_valid_papers_original_photos}</h6>

                <div className="mt-1 w-75">
                    <label style={{ fontSize: 12 }}>{trans[locate].select_the_type_of_document}</label>
                    <select className="form-select" style={{ boxShadow: 'none' }} >
                        <option selected>{trans[locate].id_card}</option>
                    </select>
                </div>

                <div className="row mt-3 w-100">
                    <div className="col-xl-6 d-flex justify-content-center justify-content-xl-start align-items-start">
                        <div style={{ width: 250 }} className="d-flex flex-column justify-content-center align-items-start">
                            <a role="button" className="input-card" style={{...imageCardFront&&{border: 0}}}>
                                <span style={{ color: '#9f9f9f' }}>{trans[locate].front_side}</span>
                                <span style={{ fontSize: '3rem', color: '#9f9f9f' }}>
                                    <i className="fa-light fa-id-card"></i>
                                </span>
                                <input ref={refInputCardFront} onChange={onChangeCardFront} type="file" accept="image/*" style={{display: 'none'}} />
                                {imageCardFront && (
                                    <div className="img-card">
                                        <img src={imageCardFront} alt="img_card" />
                                    </div>
                                )}
                                
                            </a>
                            <div className="mt-1 mb-2 d-flex justify-content-between align-items-center w-100"  >
                               <div>
                                    {!imageCardFront ? (
                                        <button onClick={() => refInputCardFront.current.click()} className="button" style={{ color: '#198754', border: '1px solid #198754', padding: '2px 5px', borderRadius: 5, fontSize: 13 }}>
                                            {trans[locate].upload_image}
                                        </button>
                                    ) : (
                                        <button onClick={() => {
                                            refInputCardFront.current.value = null
                                            setImageCardFront('')
                                            setIdCardFront(new IdCardFront())
                                        }} className="button" style={{ color: 'red', border: '1px solid red', padding: '2px 5px', borderRadius: 5, fontSize: 13 }}>
                                            {trans[locate].remove_image}
                                        </button>
                                    )}  
                               </div>
                                {uploadingCardFront && (
                                    <div className="d-flex align-items-center">
                                        <CircleSpinner color="#E9B261" size={15} />
                                        <span className="ms-1">{trans[locate].processing}...</span>
                                    </div>
                                )}
                                {!uploadingCardFront && (
                                    <div style={{ lineHeight: 1 }}>
                                        <i style={{...idCardFront.id && {color: '#36dc16'}}} className="fa-solid fa-circle-check"></i>
                                        <span className="ms-1">{trans[locate].valid}</span>
                                    </div>
                                )}
                              
                            </div>

                            {!statusVerifyIdCard.front && (<h6 className="auth-page--input-message-error text-center m-0 p-0 block w-100">{trans[locate].unverified_data}</h6>)}

                            <div className="d-flex justify-content-between align-items-center w-100 mt-2 lh-1">
                                <label>{trans[locate].fullname}: </label>
                                <input onChange={e => onChangeIdCardFront('name')(e.target.value)} type="text" className="kyc--input-card" value={idCardFront.name} />
                            </div>

                            <div className="d-flex justify-content-between align-items-center w-100 mt-2 lh-1">
                                <label>{trans[locate].id_no}: </label>
                                <input onChange={e => onChangeIdCardFront('id')(e.target.value)} type="text" className="kyc--input-card" value={idCardFront.id} />
                            </div>

                            <div className="d-flex justify-content-between align-items-center w-100 mt-2 lh-1">
                                <label>{trans[locate].sex}: </label>
                                <input onChange={e => onChangeIdCardFront('sex')(e.target.value)} type="text" className="kyc--input-card" value={idCardFront.sex} />
                            </div>
                            <div className="d-flex justify-content-between align-items-center w-100 mt-2 lh-1">
                                <label>{trans[locate].address}: </label>
                                <input onChange={e => onChangeIdCardFront('address')(e.target.value)} type="text" className="kyc--input-card" value={idCardFront.address} />
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-6 d-flex justify-content-center justify-content-xl-end align-items-start mt-3 mt-xl-0">
                        <div style={{ width: 250 }} className="d-flex flex-column justify-content-center align-items-end">
                            <a role="button" className="input-card" style={{...imageCardBack&&{border: 0}}} >
                                <span style={{ color: '#9f9f9f' }}>{trans[locate].back_side}</span>
                                <span style={{ fontSize: '3rem', color: '#9f9f9f' }}>
                                    <i className="fa-light fa-id-card"></i>
                                </span>
                                <input ref={refInputCardBack} onChange={onChangeCardBack} type="file" accept="image/*" style={{display: 'none'}} />
                                {imageCardBack && (
                                    <div className="img-card">
                                        <img src={imageCardBack} alt="img_card" />
                                    </div>
                                )}
                            </a>
                            <div className="mt-1 mb-2 d-flex justify-content-between align-items-center w-100"  >
                                <div>
                                    {!imageCardBack ? (
                                        <button onClick={() => refInputCardBack.current.click()} className="button" style={{ color: '#198754', border: '1px solid #198754', padding: '2px 5px', borderRadius: 5, fontSize: 13 }}>
                                            {trans[locate].upload_image}
                                        </button>
                                    ) : (
                                        <button onClick={() => {
                                            refInputCardBack.current.value = null
                                            setImageCardBack('')
                                            setIdCardBack(new IdCardBack())
                                        }} className="button" style={{ color: 'red', border: '1px solid red', padding: '2px 5px', borderRadius: 5, fontSize: 13 }}>
                                            {trans[locate].remove_image}
                                        </button>
                                    )}
                                </div>
                                {uploadingCardBack && (
                                    <div className="d-flex align-items-center">
                                        <CircleSpinner color="#E9B261" size={15} />
                                        <span className="ms-1">{trans[locate].processing}...</span>
                                    </div>
                                )}
                                {!uploadingCardBack && (
                                    <div style={{ lineHeight: 1 }}>
                                        <i style={{...idCardBack.issue_date && {color: '#36dc16'}}} className="fa-solid fa-circle-check"></i>
                                        <span className="ms-1">{trans[locate].valid}</span>
                                    </div>
                                )}
                            </div>
                            
                            {!statusVerifyIdCard.back && (<h6 className="auth-page--input-message-error text-center m-0 p-0 block w-100">{trans[locate].unverified_data}</h6>)}
                            
                            <div className="d-flex justify-content-between align-items-center w-100 mt-2 lh-1">
                                <label>{trans[locate].issued_date}: </label>
                                <input onChange={e => onChangeIdCardBack('issue_date')(e.target.value)} type="text" className="kyc--input-card" value={idCardBack.issue_date} />
                            </div>
                            <div className="d-flex justify-content-between align-items-center w-100 mt-2 lh-1">
                                <label>{trans[locate].issued_by}: </label>
                                <input onChange={e => onChangeIdCardBack('issue_loc')(e.target.value)} type="text" className="kyc--input-card" value={idCardBack.issue_loc} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-75 mx-auto mt-3">
                    <RegBtnSubmit onClick={next} type="next" title={trans[locate].next} loading={nextLoading} />
                </div>

            </div>
        </>
    )
}