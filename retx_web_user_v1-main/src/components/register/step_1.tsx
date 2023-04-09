import PhoneInput from 'react-phone-input-2'
import { Checkbox } from 'antd';
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import router from 'next/router';

import { routeNames } from '@utils/router';
import RegBtnSubmit from './btn_submit';
import { KeyUserRegisterDTO, UserRegisterDTO } from 'src/models/user/user.model';
import { isContainsNumber } from '@utils/string';
import { authActions } from '@store/actions';
import { authApi, userApi } from '@apis/index';
import { locateSelector } from '@store/locate/locate.slice';
import { trans } from 'src/resources/trans';
import { isEmail } from '@utils/functions';


export default function RegFormStep1() {
    const dispatch = useDispatch()

    const { locate } = useSelector(locateSelector)

    const [checkedPolicy, setCheckedPolicy] = useState(false)
    const [formRegister, setFormRegister] = useState<UserRegisterDTO>(new UserRegisterDTO())
    const [confirmPassword, setConfirmPassword] = useState('')
    const [validatePassword, setValidatePassword] = useState({
        minimum_lenght_8: false,
        digit: false
    })
    const [validateForm, setValidateForm] = useState({})
    const [loadingNext, setLoadingNext] = useState(false)
    const [countryDialCode, setCountryDialCode] = useState('')


    const onChangeForm = (fieldname: KeyUserRegisterDTO) => (value: any) => {
        setFormRegister({
            ...formRegister,
            [fieldname]: value
        })

        let errors = { ...validateForm }
        delete errors[fieldname]
        setValidateForm(errors)
    }

    const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        // console.log("submit")
        let errorsForm = {}

        // Validate confirm password 
        if (confirmPassword != formRegister.password) errorsForm['confirm_password'] = "msg_error_input_confirm_password"

        // Validate policy
        if (!checkedPolicy) errorsForm['policy'] = "must_agree_to_policy"


        if (Object.keys(errorsForm).length > 0) {
            return setValidateForm(errorsForm)
        }
        else {
            setValidateForm({})

            setLoadingNext(true)
            let temp = { ...formRegister }
            try {
                let {userId} = await userApi.validateUserRegister({...temp, phoneNumber: temp.phoneNumber.replace(countryDialCode, "0")})
                temp.userId = userId
                await authApi.otpSend({
                    type: 'sms',
                    userId,
                    scenario: 'verify_user_phone_number'
                })
                dispatch(authActions.self.cacheUserRegisting({...temp, phoneNumber: temp.phoneNumber.replace(countryDialCode, "0")}))
                dispatch(authActions.nextStepRegister())

            }
            catch (err) {
                console.log(err)
                if (!!err?.errors) {
                    setValidateForm(err.errors)
                }
            }
            setLoadingNext(false)

        }


    }

    // useEffect(() => {
    //     let validate = { ...validatePassword }

    //     if (formRegister.password.length >= 8) {
    //         validate.minimum_lenght_8 = true;
    //     }
    //     else validate.minimum_lenght_8 = false

    //     if (isContainsNumber(formRegister.password)) {
    //         validate.digit = true;
    //     }
    //     else validate.digit = false;

    //     setValidatePassword(validate)

    // }, [formRegister.password])



    // const isValidPassword = () => {
    //     let values = Object.values(validatePassword)
    //     let filterFalse = values.filter(item => item == false);
    //     if (filterFalse.length > 0) {
    //         return false
    //     }
    //     else return true
    // }

    return (
        <div className="row w-100">

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


            <div className="col-xl-6 d-none d-xl-block">
                <div className="d-flex flex-column justify-content-center align-items-center">
                    <img className="w-100" src="/img/reg-left.svg" alt="" />
                </div>
            </div>
            <div className="col-xl-6 col-12">
                <div className="d-flex justify-content-xl-end justify-content-center pe-xl-5">
                    <form onSubmit={onSubmit} className="register-step1--form" >
                        <PhoneInput
                            country={'vn'}
                            value={formRegister.phoneNumber}
                            onChange={(value, country, e, formattedValue) => {
                                setCountryDialCode(country['dialCode'])
                                onChangeForm('phoneNumber')(value)

                            }}
                            enableSearch
                            disableSearchIcon
                            inputStyle={{
                                padding: '7px 7px 7px 48px',
                                width: 350,
                                height: 40,
                                boxShadow: 'none',
                                ...validateForm['phoneNumber'] ? { borderColor: '#F35757' } : {}
                            }}
                            buttonStyle={{
                                // padding: 10
                                ...validateForm['phoneNumber'] ? { borderColor: '#F35757' } : {}

                            }}
                        />
                        {validateForm['phoneNumber'] && <h6 className="auth-page--input-message-error">
                            {validateForm['phoneNumber']}
                        </h6>}

                        <div className="mt-3">
                            <input
                                className={`auth-page--form-input-register  ${validateForm['email'] && 'error'}`}
                                type="text"
                                placeholder={trans[locate].email}
                                value={formRegister.email}
                                onChange={e => onChangeForm('email')(e.target.value)}
                            />
                            {validateForm['email'] && <h6 className="auth-page--input-message-error">{
                                validateForm['email']
                            }</h6>}
                        </div>

                        <div className="mt-3">
                            <input
                                className={`auth-page--form-input-register  ${validateForm['password'] && 'error'}`}
                                type="password"
                                placeholder={trans[locate].password}
                                onChange={e => onChangeForm('password')(e.target.value)}
                            />
                            {validateForm['password'] && <h6 className="auth-page--input-message-error">{
                                validateForm['password']
                            }</h6>}
                            
                            {/* <ul className="list-require-password">
                                <li>
                                    <i className={`fa-solid fa-square-check ${validatePassword.minimum_lenght_8 && 'active'}`}></i>
                                    <span>{trans[locate].minimum_8_characters}</span>
                                </li>
                                <li>
                                    <i className={`fa-solid fa-square-check ${validatePassword.digit && 'active'}`}></i>
                                    <span>{trans[locate].at_least_1_digit}</span>
                                </li>
                            </ul> */}
                        </div>

                        <div className="mt-3">
                            <input
                                className={`auth-page--form-input-register  ${validateForm['confirm_password'] && 'error'}`}
                                type="password"
                                placeholder={trans[locate].confirm_password}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                            {validateForm['confirm_password'] && <h6 className="auth-page--input-message-error">{trans[locate][validateForm['confirm_password']]}</h6>}

                        </div>

                        <div className="mt-3">
                            <div className="d-flex">
                                <Checkbox
                                    onChange={e => setCheckedPolicy(e.target.checked)}
                                    value={checkedPolicy}
                                    style={{
                                        color: "#009525"
                                    }}

                                ></Checkbox>
                                <a href={routeNames.policy(locate)} target="_blank" style={{ color: "#009525", marginLeft: 10, textDecoration: 'underline' }}>
                                    {trans[locate].i_agree_with_policy}
                                </a>
                            </div>

                            {validateForm['policy'] && <h6 className="auth-page--input-message-error">{trans[locate][validateForm['policy']]}</h6>}


                        </div>

                        <div className="mt-4">
                            <RegBtnSubmit onClick={() => { }} type="next" title={trans[locate].next} loading={loadingNext} />
                        </div>

                    </form>
                </div>
            </div>

            <style jsx global>{`
                    .ant-checkbox-checked .ant-checkbox-inner {
                        background-color: #f1c339;
                        border-color: #f1c339 !important;
                    }
                    .ant-checkbox .ant-checkbox-inner {
                        border-color: #cacaca !important;
                    }
                    .ant-checkbox-wrapper:hover .ant-checkbox-inner,
                    .ant-checkbox:hover .ant-checkbox-inner,
                    .ant-checkbox-input:focus+.ant-checkbox-inner {
                        border-color:  #f1c339 !important;
                    }

                    .ant-checkbox-indeterminate .ant-checkbox-inner::after {
                        background-color: #f1c339 !important;
                    }
                `}</style>
        </div>
    )
}