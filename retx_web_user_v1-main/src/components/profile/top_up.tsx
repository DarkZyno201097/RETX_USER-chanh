import { locateSelector } from "@store/locate/locate.slice";
import { useDispatch, useSelector } from "react-redux";
import { trans } from "src/resources/trans";
import { Select, Tabs } from 'antd';
import { ChangeEvent, useEffect, useState } from "react";
import moment from "moment";
import _ from 'lodash'
import { CircleSpinner, StageSpinner } from "react-spinners-kit";
import Web3 from "web3";
import { useMetaMask } from "metamask-react";
import { Contract } from "web3-eth-contract";

import { alertActions, transactionActions } from "@store/actions";
import { transactionSelector } from "@store/transaction/transaction.slice";
import { slugify } from "@utils/string";
import { FormTopupCreate, FormWithdrawCreate } from "src/models/transaction.model";
import { convertFormattedNumberToNumber, divValueBlock, formatCurrency } from "@utils/number";
import { authSelector } from "@store/auth/auth.slice";
import CountdownExpired from "@components/text/contdown_expired";
import { contractSelector } from "@store/contract/contract.slice";
import AbiCoin from 'src/resources/mock/token_abi.json'
import { authApi, transactionApi } from "@apis/index";
import TransactionTopupHistory from "@components/transaction_history/topup";
import TransactionWithdrawHistory from "@components/transaction_history/withdraw";
import ModalBase from "@components/modal";

const { TabPane } = Tabs;
const { Option } = Select;


export default function ProfileTopUp() {
    const dispatch = useDispatch();

    const { locate } = useSelector(locateSelector)
    const {
        banks,
        bankAccounts,
        loadingTopupTransactionInit,
        loadingTopupConfirm,
        transactionInitTopup,
        loadingTransferedToptupTransaction,
        errorsValidate,
        loadingCreateWithdrawTransaction,
        transactionWithdrawPending,
        loadingCancelWithdrawTransaction,
        loadingBanks,
        loadingBankAccounts
    } = useSelector(transactionSelector)

    const { user, authenticated } = useSelector(authSelector)
    const {
        loadedInfoContracts,
        infoContract,
        web3Contract
    } = useSelector(contractSelector)
    const { status, connect, account, chainId, ethereum } = useMetaMask();
    const { balance } = useSelector(contractSelector)
    const [formTopupCreate, setFormTopupCreate] = useState<FormTopupCreate>(new FormTopupCreate())
    const [formWithdrawCreate, setFormWithdrawCreate] = useState<FormWithdrawCreate>(new FormWithdrawCreate())
    const [web3, setWeb3] = useState<Web3>(null)
    const [contractCoin, setContractCoin] = useState<Contract>(null)
    const [loadingApprove, setLoadingApprove] = useState(false)
    const [showModalNotiTopup, setShowModalNotiTopup] = useState(false)

    useEffect(() => {
        setContractCoin(web3Contract.stableCoin)
    }, [])


    const onChangeBankAccount = (value: string) => {
        let temp = { ...formTopupCreate }
        temp.bankId = value;
        setFormTopupCreate(temp)
        dispatch(transactionActions.refreshFieldError('bankId'))
    }

    const onChangeBank = (value: string) => {
        let temp = { ...formWithdrawCreate }
        temp.receiveBank = value
        setFormWithdrawCreate(temp)
        dispatch(transactionActions.refreshFieldError('receiveBank'))
    }

    useEffect(() => {
        dispatch(transactionActions.banksList())
        dispatch(transactionActions.bankAccountsList())
        dispatch(transactionActions.clearErrorsValidate())
    }, [])
    useEffect(() => {
        if (!!user?.id) {
            dispatch(transactionActions.getTopupTransactionInit(user?.id))
        }
    }, [user])

    const submitFormTopup = () => {
        if (checkAuth()) {
            let data: FormTopupCreate = { ...formTopupCreate }
            data.timestamp = moment().unix().valueOf()
            data.userId = user?.id
            dispatch(transactionActions.topupConfirm(data))
        }

    }

    const [selectStatusTransaction, setSelectStatusTransaction] = useState<'pending' | 'cancelled'>('pending')

    const copy = (value: string) => {
        navigator.clipboard.writeText(value)
        dispatch(alertActions.alertSuccess(trans[locate].copy_successfully))
    }

    const onChangeFormWithdrawCreate = (e: ChangeEvent<HTMLInputElement>) => {
        let temp = { ...formWithdrawCreate }
        temp[e.target.name] = e.target.value;
        setFormWithdrawCreate(temp)
    }

    const [otpAuthenticated, setOtpAuthenticated] = useState(false)
    const [openModalOTPAuth, setOpenModalOTPAuth] = useState(false)
    const [otpAuthValue, setOtpAuthValue] = useState('')
    const [otpTokenPhone, setOtpTokenPhone] = useState('')
    const [expiredCodeAt, setExpiredCodeAt] = useState(null)

    const submitFormWithdraw = async () => {

        if (window.innerWidth <= 992) {
            dispatch(alertActions.alertError(trans[locate].this_feature_is_only_operated_on_the_computer))
            return;
        }

        if (!otpAuthenticated) {
            setOpenModalOTPAuth(true)
            let data = await authApi.otpSend({
                scenario: 'user_withdraw',
                type: 'sms',
                userId: user?.id
            })
            setExpiredCodeAt(data.expiredCodeAt)
            return;
        }

        if (checkAuth() && otpAuthenticated) {
            try {
                let data = { ...formWithdrawCreate }
                data.userId = user?.id
                data.otpTokenPhone = otpTokenPhone
                console.log(data)
                if (balance < data.amount) {
                    dispatch(alertActions.alertError(trans[locate].insufficient_balance))
                    return;
                }

                setLoadingApprove(true)

                await contractCoin?.methods.approve(
                    infoContract.systemWallet.address,
                    data.amount
                ).send({ from: user.walletAddress })

                setLoadingApprove(false)

                dispatch(transactionActions.createWithdrawTransaction(data, async () => {
                    setFormWithdrawCreate(new FormWithdrawCreate())
                    dispatch(alertActions.alertSuccess(trans[locate].withdrawal_request_successful))
                    setOtpAuthenticated(false)
                    setOtpAuthValue('')
                }))

            }
            catch (err) {
                console.log(err)
                setLoadingApprove(false)
                err?.message && dispatch(alertActions.alertError(err.message))
            }
        }

    }

    useEffect(() => {
        dispatch(transactionActions.getTransactionWithdrawPending(user?.id))
    }, [])

    const isAuthWallet = () => {
        if (status != 'connected') {
            return false
        }
        else if (!user.walletAddress) {
            return false
        }
        else if (user.walletAddress.toLowerCase() != account.toLowerCase()) {
            return false
        }
        else {
            return true
        }
    }

    const checkAuth = () => {
        if (!authenticated) {
            dispatch(alertActions.alertError(trans[locate].you_need_to_sign_in))
            return false
        }
        else if (status == 'unavailable') {
            dispatch(alertActions.alertError(trans[locate].you_need_install_metamask))
            return false
        }
        else if (status != 'connected') {
            dispatch(alertActions.alertError(trans[locate].you_need_to_connect_the_wallet))
            return false
        }
        else if (!user.walletAddress) {
            dispatch(alertActions.alertError(trans[locate].you_need_to_verify_wallet))
            return false
        }
        else if (user.walletAddress.toLowerCase() != account.toLowerCase()) {
            dispatch(alertActions.addressConnectedNotMatch({
                isConnected: status == 'connected',
                myAddress: user.walletAddress,
                connectedAddress: account,
                message: trans[locate].the_address_not_match_the_registered_account_address
            }))
            return false
        }
        else {
            return true
        }
    }

    const [errorsOTP, setErrorsOTP] = useState({})

    const verifyOtpPhone = async () => {
        setErrorsOTP({})

        if (!otpAuthValue) {
            setErrorsOTP({ code: trans[locate].please_enter_the_OTP_sent_to_your_phone_number })
            return;
        }

        try {
            let { otpToken } = await authApi.otpVerify({
                type: 'sms',
                userId: user?.id,
                otpCode: otpAuthValue,
                scenario: 'user_withdraw'
            })
            setOtpTokenPhone(otpToken)
            setErrorsOTP({})
            setOpenModalOTPAuth(false)
            setOtpAuthenticated(true)

        }
        catch (err) {
            console.log(err)
            setOtpAuthenticated(false)
            err?.errors && setErrorsOTP(err?.errors)
        }


    }

    const clostModalOTPAuth = () => {
        setOpenModalOTPAuth(false);
        setOtpAuthValue('');
        setErrorsOTP({})
        setExpiredCodeAt(null)
    }

    return (
        <div className=" d-flex justify-content-center w-100">

            <ModalBase
                visible={openModalOTPAuth}
                onCancel={() => { clostModalOTPAuth() }}
            >
                <div className="bg-white p-4">
                    <div className="title">
                        <h5 className="text-left text-uppercase fw-bold ">
                            {trans[locate].sms_otp_authentication}
                        </h5>
                    </div>
                    <div>
                        <div className="mb-3">
                            <h6>
                                {trans[locate].otp_has_been_sent_to_your_phone_number}
                                <span className="mx-1">
                                    {user?.phoneNumber.slice(0, 4) + "***" + user?.phoneNumber?.slice(-4)}
                                </span>
                                {trans[locate].please_enter_OTP_to_continue}! {`(15 ${trans[locate].minute})`}
                            </h6>
                            <a onClick={() => { clostModalOTPAuth() }} role="button" style={{
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
                            <input
                                type="text"
                                className="metadap-input"
                                onChange={(e) => {
                                    setErrorsOTP({})
                                    setOtpAuthValue(e.target.value)
                                }}
                                value={otpAuthValue}
                            />
                            {errorsOTP['code'] && (
                                <span className="input-message-error">
                                    {errorsOTP['code']}
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="d-flex justify-content-end">
                                <a onClick={async () => {
                                    setExpiredCodeAt(null)
                                    let data = await authApi.otpSend({
                                        scenario: 'user_withdraw',
                                        type: 'sms',
                                        userId: user?.id
                                    })
                                    setExpiredCodeAt(data.expiredCodeAt)
                                    dispatch(alertActions.alertSuccess(trans[locate].resend_OTP_successfully))
                                }} role={"button"} style={{ fontWeight: 600, color: "#727272" }} >
                                    {trans[locate].resend_verification_code}
                                </a>
                            </div>
                            <button onClick={verifyOtpPhone} className="btn-primary-light w-100 my-2 d-flex justify-content-center align-items-center fw-bold gap-3">
                                <span className="py-1" style={{ lineHeight: 1 }} >
                                    {trans[locate].confirm}
                                </span>
                                <CircleSpinner size={18} loading={false} />
                            </button>
                        </div>
                    </div>
                </div>
            </ModalBase>

            <ModalBase
                visible={showModalNotiTopup}
                onCancel={() => {
                    setShowModalNotiTopup(false)
                }}
            >
                <div className="bg-white p-4">
                    <div className="title">
                        <h5 className="text-left text-uppercase fw-bold ">
                            {trans[locate].notification}
                        </h5>
                    </div>
                    <div>
                        <a onClick={() => {
                            setShowModalNotiTopup(false)
                        }} role="button" style={{
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
                        <div className="mb-3">
                            <h6>
                                {trans[locate].the_system_has_recorded_your_transaction_and_the_transaction_will_be_processed_within_30_minutes_please_wait}
                            </h6>

                        </div>

                    </div>
                </div>
            </ModalBase>

            <Tabs
                style={{ width: '100%', }}
                tabBarStyle={{ width: '100%', fontSize: '1.5rem' }}
                defaultActiveKey="1"
                onChange={(value: string) => {
                    dispatch(transactionActions.clearErrorsValidate())
                }}
            >
                <TabPane tab={trans[locate].deposit} key="1">
                    {!user.hasUploadedKyc || user.kycStatus == 'reject' ? (
                        <b className="input-message-error fs-5 m-0 p-0" >
                            {trans[locate].you_need_KYC_erification_to_be_able_to_make_transactions}
                        </b>
                    ):null}
                    {user.kycStatus == 'pending' && !!user.hasUploadedKyc && (
                        <b className="input-message-error fs-5 m-0 p-0" >
                            {trans[locate].we_are_verifying_your_information_please_return_to_trading_in_24h}
                        </b>
                    )}
                    {user.kycStatus == 'verified' && (
                        <>
                            {loadingTopupTransactionInit && loadingBankAccounts && (
                                <div className="d-flex justify-content-center" >
                                    <StageSpinner loading={true} color="#fec128" />
                                </div>
                            )}
                            {/* Form xác nhận giao dịch */}
                            {!transactionInitTopup?.id && !loadingTopupTransactionInit && !loadingBankAccounts && (
                                <div style={{
                                    display: !!transactionInitTopup?.id ? 'none' : "block"
                                }} >
                                    <div className="mb-3">
                                        <h6>
                                            {trans[locate].amount_you_want_to_deposit}
                                        </h6>
                                        <input
                                            type="text"
                                            onKeyPress={(event) => {
                                                if (!/[0-9]/.test(event.key)) {
                                                    event.preventDefault()
                                                }
                                            }}
                                            onChange={(event) => {
                                                setFormTopupCreate({
                                                    ...formTopupCreate,
                                                    amount: convertFormattedNumberToNumber(event.target.value)
                                                })
                                                dispatch(transactionActions.refreshFieldError('amount'))
                                            }}
                                            className="metadap-input"
                                            placeholder={"0 đ"}
                                            value={formTopupCreate.amount.toLocaleString('vi-VN')}
                                        />
                                        {errorsValidate?.amount && (
                                            <span className="input-message-error">{errorsValidate?.amount[0]?.message}</span>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <h6>{trans[locate].receive_bank}</h6>
                                        <Select
                                            showSearch
                                            placeholder={trans[locate].choose_a_bank}
                                            optionFilterProp="children"
                                            onChange={onChangeBankAccount}
                                            // onSearch={setSearchTextBank}
                                            style={{
                                                width: '100%'
                                            }}
                                            size="large"
                                            filterOption={(input, option) =>
                                                slugify(option!.children as unknown as string).includes(slugify(input.toLowerCase()))
                                            }
                                        >
                                            {/* <Option value={''}>Chọn ngân hàng</Option> */}
                                            {
                                                Object.values(_.groupBy(bankAccounts, 'bank')).map(item => item[0])
                                                    // .filter(item => slugify(`${item.name} ${item.shortName}`).includes(slugify(searchTextBank)))
                                                    .map(item => (
                                                        <Option key={item.id} value={item.id}>{`${item.name} (${item.shortName})`}</Option>
                                                    ))
                                            }
                                        </Select>
                                        {errorsValidate?.bankId && (
                                            <span className="input-message-error">{errorsValidate?.bankId[0]?.message}</span>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <h6>
                                            {trans[locate].receive_account_name}
                                        </h6>
                                        <input
                                            type="text"
                                            disabled
                                            value={formTopupCreate.bankId && bankAccounts.filter(item => item.id == formTopupCreate.bankId)?.[0]?.accountHolder}
                                            className="metadap-input"
                                        />
                                    </div>
                                    <div className="mb-3" style={{ position: 'relative' }}>
                                        <h6>
                                            {trans[locate].receive_account_number}
                                        </h6>
                                        <input
                                            type="text"
                                            disabled
                                            value={formTopupCreate.bankId && bankAccounts.filter(item => item.id == formTopupCreate.bankId)?.[0]?.accountNumber}
                                            className="metadap-input"
                                        />
                                        <button
                                            className="border-0"
                                            style={{
                                                position: "absolute",
                                                bottom: 5,
                                                right: 10,
                                                fontSize: '1.2rem',
                                                backgroundColor: "transparent",
                                                color: "#8f8f8f"
                                            }}
                                            onClick={() => copy(bankAccounts.filter(item => item.id == formTopupCreate.bankId)?.[0]?.accountNumber)}
                                        >
                                            <i className="fa-solid fa-copy"></i>
                                        </button>
                                    </div>
                                    <div className="d-none d-xl-block">
                                        <button onClick={submitFormTopup} className="btn-primary-light w-100 my-2 d-flex justify-content-center align-items-center fw-bold gap-3">
                                            <span className="py-1" style={{ lineHeight: 1 }} >
                                                {trans[locate].next}
                                            </span>
                                            <CircleSpinner size={18} loading={loadingTopupConfirm} />
                                        </button>
                                    </div>
                                    <div className="d-block d-xl-none">
                                        <button onClick={() => {
                                            dispatch(alertActions.alertError("Tính năng này chỉ được thao tác trên máy tính"))
                                        }} className="btn-primary-light w-100 my-2 d-flex justify-content-center align-items-center fw-bold gap-3">
                                            <span className="py-1" style={{ lineHeight: 1 }} >
                                                {trans[locate].next}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Giao dịch đang thực hiện */}
                            {transactionInitTopup?.id && (
                                <div>
                                    <b style={{ fontSize: 16 }}>{trans[locate].deposit_order_placed} </b> <br />
                                    <b style={{ fontSize: 16 }}>{trans[locate].please_pay_within}
                                        <CountdownExpired
                                            expired={transactionInitTopup?.expiredAt}
                                            onExpired={() => {
                                                dispatch(transactionActions.getTopupTransactionInit(user?.id))
                                                setFormTopupCreate(new FormTopupCreate())
                                            }}
                                        /> </b>
                                    <div className="mt-3" />
                                    <div className="mb-3">
                                        <h6>{trans[locate].amount_to_transfer}</h6>
                                        <input
                                            type="text"
                                            disabled
                                            value={formatCurrency(transactionInitTopup?.amount.toString()) + "đ"}
                                            className="metadap-input"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <h6>{trans[locate].receive_bank}</h6>
                                        <input
                                            type="text"
                                            disabled
                                            value={`${transactionInitTopup?.bankAccount.name} (${transactionInitTopup?.bankAccount.shortName})`}

                                            className="metadap-input"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <h6>{trans[locate].receive_account_name}</h6>
                                        <input
                                            type="text"
                                            disabled
                                            value={transactionInitTopup?.bankAccount.accountHolder}
                                            className="metadap-input"
                                        />
                                    </div>
                                    <div className="mb-3" style={{ position: 'relative' }}>
                                        <h6>{trans[locate].receive_account_number}</h6>
                                        <input
                                            type="text"
                                            disabled
                                            value={transactionInitTopup?.bankAccount.accountNumber}
                                            className="metadap-input"
                                        />
                                        <button
                                            className="border-0"
                                            style={{
                                                position: "absolute",
                                                bottom: 5,
                                                right: 10,
                                                fontSize: '1.2rem',
                                                backgroundColor: "transparent",
                                                color: "#8f8f8f"
                                            }}
                                            onClick={() => copy(transactionInitTopup?.bankAccount.accountNumber)}
                                        >
                                            <i className="fa-solid fa-copy"></i>
                                        </button>
                                    </div>
                                    <div className="mb-3" style={{ position: 'relative' }}>
                                        <h6>{trans[locate].transfer_contents}</h6>
                                        <input type="text" disabled value={transactionInitTopup?.content} className="metadap-input" />
                                        <button
                                            className="border-0"
                                            style={{
                                                position: "absolute",
                                                bottom: 5,
                                                right: 10,
                                                fontSize: '1.2rem',
                                                backgroundColor: "transparent",
                                                color: "#8f8f8f"
                                            }}
                                            onClick={() => copy(transactionInitTopup?.content)}
                                        >
                                            <i className="fa-solid fa-copy"></i>
                                        </button>
                                    </div>
                                    <div className="mb-3">
                                        <p className="fw-bold">
                                            {trans[locate].please_transfer_the_amount} <span style={{ color: "#ff4242" }}>{formatCurrency(transactionInitTopup?.amount.toString())}đ</span> {trans[locate].to_the_account_you_selected_with_the_transfer_content_is} <span style={{ color: "#ff4242" }}> {transactionInitTopup?.content} </span> <br />
                                            {trans[locate].then_click_transferred_button}
                                        </p>
                                    </div>
                                    <div>
                                        <button onClick={() => {
                                            dispatch(transactionActions.transferedToptupTransaction('pending', () => {
                                                setShowModalNotiTopup(true)
                                                setFormTopupCreate(new FormTopupCreate())
                                            }))
                                            setSelectStatusTransaction('pending')


                                        }} className="btn-primary-light w-100 my-2 d-flex justify-content-center align-items-center fw-bold gap-3">
                                            <span className="py-1" style={{ lineHeight: 1 }} >
                                                {trans[locate].confirmed_transfer}
                                            </span>
                                            <CircleSpinner size={18} loading={loadingTransferedToptupTransaction && selectStatusTransaction == 'pending'} />
                                        </button>
                                        <button onClick={() => {
                                            dispatch(transactionActions.transferedToptupTransaction('cancelled', () => {
                                                setFormTopupCreate(new FormTopupCreate())
                                            }))
                                            setSelectStatusTransaction('cancelled')
                                        }} className="btn-primary-light w-100 my-2 d-flex justify-content-center align-items-center fw-bold gap-3" style={{ backgroundColor: '#cacaca' }}>
                                            <span className="py-1" style={{ lineHeight: 1 }} >
                                                {trans[locate].cancel_transaction}
                                            </span>
                                            <CircleSpinner size={18} loading={loadingTransferedToptupTransaction && selectStatusTransaction == 'cancelled'} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                </TabPane>
                <TabPane tab={trans[locate].withdraw} key="2">
                    {!user.hasUploadedKyc || user.kycStatus == 'reject' ? (
                        <b className="input-message-error fs-5 m-0 p-0" >
                            {trans[locate].you_need_KYC_erification_to_be_able_to_make_transactions}
                        </b>
                    ):null}

                    {user.kycStatus == 'pending' && !!user.hasUploadedKyc && (
                        <b className="input-message-error fs-5 m-0 p-0" >
                            {trans[locate].we_are_verifying_your_information_please_return_to_trading_in_24h}
                        </b>
                    )}


                    {user.kycStatus == 'verified' && (
                        <div>
                            {loadingBanks && !transactionWithdrawPending?.id && (
                                <div className="d-flex justify-content-center" >
                                    <StageSpinner loading={true} color="#fec128" />
                                </div>
                            )}

                            {transactionWithdrawPending?.id && (
                                <div className="mb-3">
                                    <b style={{ fontSize: 16 }}>{trans[locate].withdrawal_order_placed}</b> <br />
                                    <b style={{ fontSize: 16 }}>{trans[locate].please_wait_for_us_to_process_your_request_in_another_24_hours}</b>
                                </div>
                            )}

                            {!loadingBanks && (
                                <>
                                    <div className="mb-3">
                                        <h6>{trans[locate].amount_you_want_to_withdraw}</h6>
                                        <input
                                            type="text"
                                            onKeyPress={(event) => {
                                                if (!/[0-9]/.test(event.key)) {
                                                    event.preventDefault()
                                                }
                                            }}
                                            onChange={(event) => {
                                                setFormWithdrawCreate({
                                                    ...formWithdrawCreate,
                                                    amount: convertFormattedNumberToNumber(event.target.value)
                                                })
                                                dispatch(transactionActions.refreshFieldError('amount'))
                                            }}
                                            className="metadap-input"
                                            placeholder={"0 đ"}
                                            value={formWithdrawCreate.amount.toLocaleString('vi-VN')}
                                            // value={formatCurrency(transactionWithdrawPending?.amount.toString() || formWithdrawCreate.amount)}
                                        />
                                        {errorsValidate?.amount && (
                                            <span className="input-message-error">{errorsValidate?.amount[0]?.message}</span>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <h6>{trans[locate].receive_bank}</h6>
                                        <Select
                                            showSearch
                                            placeholder={trans[locate].choose_a_bank}
                                            optionFilterProp="children"
                                            onChange={onChangeBank}
                                            // onSearch={setSearchTextBank}
                                            style={{
                                                width: '100%'
                                            }}
                                            size="large"
                                            filterOption={(input, option) =>
                                                slugify(option!.children as unknown as string).includes(slugify(input.toLowerCase()))
                                            }
                                            value={transactionWithdrawPending?.receiveBank || formWithdrawCreate.receiveBank}
                                        >
                                            {/* <Option value={''}>Chọn ngân hàng</Option> */}
                                            {
                                                banks
                                                    .map(item => (
                                                        <Option key={item.code} value={item.code}>{`${item.name} (${item.shortName})`}</Option>
                                                    ))
                                            }
                                        </Select>
                                        {errorsValidate?.receiveBank && (
                                            <span className="input-message-error">{errorsValidate?.receiveBank[0]?.message}</span>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <h6>{trans[locate].receive_account_name}</h6>
                                        <input
                                            type="text"
                                            onChange={onChangeFormWithdrawCreate}
                                            className="metadap-input"
                                            value={transactionWithdrawPending?.receiveBankAccountHolder || formWithdrawCreate.receiveBankAccountHolder}
                                            name="receiveBankAccountHolder"
                                        />
                                        {errorsValidate?.receiveBankAccountHolder && (
                                            <span className="input-message-error">{errorsValidate?.receiveBankAccountHolder[0]?.message}</span>
                                        )}
                                    </div>
                                    <div className="mb-3" style={{ position: 'relative' }}>
                                        <h6>{trans[locate].receive_account_number}</h6>
                                        <input
                                            onKeyPress={(event) => {
                                                if (!/[0-9]/.test(event.key)) {
                                                    event.preventDefault()
                                                }
                                            }}
                                            onChange={onChangeFormWithdrawCreate}
                                            type="text"
                                            className="metadap-input"
                                            name="receiveBankAccountNumber"
                                            value={transactionWithdrawPending?.receiveBankAccountNumber || formWithdrawCreate.receiveBankAccountNumber}
                                        />
                                        {errorsValidate?.receiveBankAccountNumber && (
                                            <span className="input-message-error">{errorsValidate?.receiveBankAccountNumber[0]?.message}</span>
                                        )}
                                    </div>
                                </>
                            )}


                            {!transactionWithdrawPending?.id
                                && !!formWithdrawCreate.amount
                                && !!formWithdrawCreate.receiveBank
                                && !!formWithdrawCreate.receiveBankAccountHolder
                                && !!formWithdrawCreate.receiveBankAccountNumber
                                ? (
                                    <div>
                                        <button onClick={submitFormWithdraw} className="btn-primary-light w-100 my-2 d-flex justify-content-center align-items-center fw-bold gap-3">
                                            <span className="pt-1" >
                                                {otpAuthenticated ? trans[locate].submit_a_withdrawal_request : trans[locate].next}
                                            </span>
                                            <CircleSpinner size={18} loading={loadingCreateWithdrawTransaction || loadingApprove} />
                                        </button>
                                    </div>
                                ) : !transactionWithdrawPending?.id && (
                                    <div>
                                        <button disabled className="btn-primary-light w-100 my-2 d-flex justify-content-center align-items-center fw-bold gap-3" style={{ backgroundColor: '#cacaca' }}>
                                            <span className="pt-1" >
                                                {trans[locate].next}
                                            </span>
                                            <CircleSpinner size={18} loading={loadingCreateWithdrawTransaction || loadingApprove} />
                                        </button>
                                    </div>
                                )}

                            {transactionWithdrawPending?.id && transactionWithdrawPending.status != 'half-done' && (
                                <div>
                                    <button onClick={() => dispatch(transactionActions.cancelWithdrawTransaction(user?.id, transactionWithdrawPending?.id))} className="btn-primary-light w-100 my-2 d-flex justify-content-center align-items-center fw-bold gap-3" style={{ backgroundColor: '#cacaca' }} >
                                        <span className="pt-1" >
                                            {trans[locate].cancel_withdrawal_request}
                                        </span>
                                        <CircleSpinner size={18} loading={loadingCancelWithdrawTransaction} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}



                </TabPane>
                <TabPane tab={trans[locate].recharge_history} key={"3"} >
                    <TransactionTopupHistory />
                </TabPane>
                <TabPane tab={trans[locate].withdrawal_history} key={"4"} >
                    <TransactionWithdrawHistory />
                </TabPane>
            </Tabs>
        </div>
    )
}