import ModalBase from "@components/modal";
import { alertActions, contractActions } from "@store/actions";
import { authSelector } from "@store/auth/auth.slice";
import { contractSelector } from "@store/contract/contract.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { formatCurrency } from "@utils/number";
import { routeNames } from "@utils/router";
import { useMetaMask } from "metamask-react";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";
import { CircleSpinner } from "react-spinners-kit";
import { trans } from "src/resources/trans";
import { Contract } from "web3-eth-contract";

interface IProps {
    onChangeStatusPay: () => void;
    balanceAsset: number,
    balanceStableCoin: number,
    productId: string,
    assetAddress: string,
    balanceCurAsset: () => Promise<number>,
    balanceCurStableCoin: () => Promise<number>,
    maxPoolAsset: number,
    maxPoolStableCoin: number,
    PATH: string[],
    onConfirmSuccess: () => void,
    assetContract: Contract,
    disabled:boolean
}

export default function SellSwap(props: IProps) {
    const dispatch = useDispatch()
    const router = useRouter()
    const { locate } = useSelector(locateSelector)
    const { authenticated, user } = useSelector(authSelector)
    const { status, connect, account, chainId, ethereum } = useMetaMask();
    const { infoContract, web3Contract } = useSelector(contractSelector)


    const [inputAsset, setInputAsset] = useState(BigInt(0))
    const [inputStableCoin, setInputStableCoin] = useState(BigInt(0))
    const [focusInput, setFocusInput] = useState<'inputStableCoin' | 'inputAsset'>(null)
    const [isApprove, setIsApprove] = useState(false)
    const [agreeModalConfirm, setAgreeModalConfirm] = useState(false)
    const [isOpenModalConfirmSwap, setIsOpenModalConfirmSwap] = useState(false)
    const [notViewBoxConfirm, setNotViewBoxConfirm] = useState(false)
    const [loadingCalcSwap, setLoadingCalcSwap] = useState(false)
    const [isApproveRules, setIsApproveRules] = useState([false, false, false])
    const [isInsufficientBalance, setIsInsufficientBalance] = useState(false)
    const [priceImpact, setPriceImpact] = useState(0)
    const [maxPool, setMaxPool] = useState(false)
    const [loadingPriceImpact, setLoadingPriceImpact] = useState(false)
    const [loadingApprove, setLoadingApprove] = useState(false)
    const [loadingConfirm, setLoadingConfirm] = useState(false)
    const [allowanceChecking, setAllowanceChecking] = useState(false)


    const onApproveRules = (index: number, value: boolean) => {
        let temp = [...isApproveRules]
        temp[index] = value
        setIsApproveRules(temp)
    }

    useEffect(() => {
        if (props.productId) {
            let buy = localStorage.getItem(`notViewBoxConfirmSwap_sell_${props.productId}`)
            if (!!buy) setNotViewBoxConfirm(true)
            else setNotViewBoxConfirm(false)
        }
    }, [props.productId])

    const isAuthWallet = () => {
        if (!authenticated) {
            return false
        }
        else if (status != 'connected') {
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

    const onChangeForm = async (amount?: BigInt) => {
        if (isAuthWallet() && web3Contract.pancakeRouter) {
            try {
                setAllowanceChecking(true)
                // throw new Error("load failed")
                console.log("start load balance allowance")
                let balanceOfAllowance = await props.assetContract?.methods.allowance(
                    user.walletAddress.toLowerCase(),
                    infoContract.pancakeRouter.address
                ).call()
                console.log("🚀 ~ file: buy_swap.tsx:102 ~ onChangeFormPayBuy ~ balanceOfAllowance", balanceOfAllowance)
                let input: any = amount || inputAsset
                if (input <= BigInt(props.balanceAsset)) {
                    if (input <= BigInt(balanceOfAllowance)) {
                        setIsApprove(false);
                    }
                    else {
                        setIsApprove(true);
                    }
                    setIsInsufficientBalance(false)
                }
                else {
                    setIsInsufficientBalance(true)
                    setIsApprove(false);
                }
                setAllowanceChecking(false)
            }
            catch (err) {
                setIsApprove(true)
                if (inputAsset.toString() != '0' || inputStableCoin.toString() != '0'){
                    dispatch(alertActions.alertWarning(`${trans[locate].web3_data_retrieval_failed}!`))
                }
            }
            console.log("end load balance allowance")
        }
    }

    useEffect(()=>{
        onChangeForm()
    }, [web3Contract.pancakeRouter])

    useEffect(() => {
        if (inputAsset && focusInput == 'inputAsset') {
            const timeOutId = setTimeout(async () => {
                try {
                    setLoadingCalcSwap(true)
                    let input_in = await web3Contract.pancakeRouter?.methods.getAmountsOut(
                        inputAsset.toString(),
                        [props.assetAddress, infoContract.stableCoin.address]
                    ).call()
                    console.log("onChange Asset:", input_in)
                    setInputStableCoin(input_in[1])
                    setAllowanceChecking(true)
                    await onChangeForm(inputAsset)
                }
                catch (e) {
                    console.log("Error CALC swap:", e)
                }
                finally {
                    setLoadingCalcSwap(false)
                }
            }, 500);
            return () => clearTimeout(timeOutId);
        }
    }, [inputAsset]);

    useEffect(() => {
        if (inputStableCoin && focusInput == 'inputStableCoin') {
            const timeOutId = setTimeout(async () => {
                try {
                    setLoadingCalcSwap(true)
                    let input_in = await web3Contract.pancakeRouter?.methods.getAmountsIn(
                        inputStableCoin.toString(),
                        [props.assetAddress, infoContract.stableCoin.address]
                    ).call()
                    console.log("onChange StableCoin:", input_in)
                    setInputAsset(input_in[0])
                    setAllowanceChecking(true)
                    await onChangeForm(input_in[0])
                }
                catch (e) {
                    console.log("Error CALC swap:", e)
                }
                finally {
                    setLoadingCalcSwap(false)
                }
            }, 500);
            return () => clearTimeout(timeOutId);
        }
    }, [inputStableCoin]);

    useEffect(() => {
        (async () => {
            if (inputAsset.toString() != '0' && inputStableCoin.toString() != '0' && !loadingCalcSwap) {
                setLoadingPriceImpact(true);
                let balanceAsset = await props.balanceCurAsset()
                let balanceStableCoin = await props.balanceCurStableCoin()

                let poolRate = balanceStableCoin / balanceAsset
                let swapRate = parseFloat(inputStableCoin.toString()) * 998 / 1000 / parseFloat(inputAsset.toString())
                let impactPrice = Math.abs((poolRate - swapRate) * 100 / poolRate)
                setPriceImpact(impactPrice)
                setLoadingPriceImpact(false);
                console.log("done")
            }
            else {
                // console.log("here")
                // setLoadingPriceImpact(true);
                setPriceImpact(0)
            }

        })()
    }, [inputAsset, inputStableCoin, loadingCalcSwap])

    useEffect(()=>{
        (async ()=>{
            if (inputAsset.toString() == '0' && focusInput == 'inputAsset') {
                await onChangeForm()
            }
        })()
    },[inputAsset])

    useEffect(()=>{
        (async ()=>{
            if (inputStableCoin.toString() == '0' && focusInput == 'inputStableCoin') {
                await onChangeForm()
            }
        })()
    },[inputStableCoin])

    useEffect(() => {
        if (props.maxPoolAsset != 0 && props.maxPoolStableCoin != 0) {
            if (parseInt(inputStableCoin.toString()) >= props.maxPoolStableCoin) {
                setMaxPool(true)
            }
            else {
                setMaxPool(false)
            }
        }

    }, [inputAsset, inputStableCoin]);

    const checkAuth = () => {
        if (window.innerWidth < 992){
            dispatch(alertActions.alertError(trans[locate].this_feature_is_only_operated_on_the_computer))

        }
        else if (!authenticated) {
            dispatch(alertActions.alertError(trans[locate].you_need_to_sign_in))
            return false
        }
         else if (!user.hasUploadedKyc || user.kycStatus == "reject") {
            dispatch(alertActions.alertError(trans[locate].you_need_KYC_erification_to_be_able_to_make_transactions))
            return false
        }
        else if (user.kycStatus == 'pending'&& !!user.hasUploadedKyc) {
            dispatch(alertActions.alertError(trans[locate].we_are_verifying_your_information_please_return_to_trading_in_24h))
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

    const approve = async () => {
        if (checkAuth() && !loadingApprove) {
            setLoadingApprove(true)
            try {
                await props.assetContract.methods.approve(
                    infoContract.pancakeRouter.address,
                    inputAsset
                ).send({from: user.walletAddress})
               
                setIsApprove(false)
            }
            catch (error) {
                console.log(error)
                setIsApprove(true)
                dispatch(alertActions.alertError(`${trans[locate].authorization_failed_please_try_again_later}!`))
            }
            finally {
                setLoadingApprove(false)
            }

        }
    }

    const openModalConfirmSwap = () => {
        if (checkAuth()) {
            if (inputStableCoin == BigInt('0')) return;
            setIsOpenModalConfirmSwap(true)
        }
    }

    const closeModalConfirmSwap = () => {
        setIsOpenModalConfirmSwap(false)
    }

    const clearForm = () => {
        setInputAsset(BigInt(0))
        setInputStableCoin(BigInt(0))
    }

    const confirm = async () => {
        if (inputAsset == BigInt('0')) return;
        if (inputStableCoin == BigInt('0')) return;


        if (checkAuth() && web3Contract?.pancakeFactory && !loadingConfirm) {
            try {
                setLoadingConfirm(true)
                let balanceOfAllowance = await props.assetContract?.methods.allowance(
                    user.walletAddress.toLowerCase(),
                    infoContract.pancakeRouter.address
                ).call()
                if (BigInt(balanceOfAllowance) < inputAsset){
                    await onChangeForm()
                }{
                    await web3Contract.pancakeRouter?.methods.swapExactTokensForTokens(
                        inputAsset,
                        inputStableCoin,
                        props.PATH,
                        account,
                        moment().add(20, 'minutes').unix().valueOf()
                    ).send({from: user.walletAddress})
                   
                    // console.log("data: ", data)
                    dispatch(contractActions.loadBalance(user.walletAddress))
    
                    clearForm()
    
                    setAgreeModalConfirm(false)
                    setIsApproveRules([false, false, false])
    
                    dispatch(alertActions.alertSuccess(trans[locate].transaction_successful))
    
                    props.onConfirmSuccess()
                }
            }
            catch (err) {
                console.log("🚀 ~ file: box_swap.tsx:363 ~ confirm ~ err", err)
                dispatch(alertActions.alertError(trans[locate].transaction_failed))
            }
            finally {
                setLoadingConfirm(false)
            }

        }

    }

    


    return (
        <>
            <ModalBase visible={isOpenModalConfirmSwap} width={600} onCancel={closeModalConfirmSwap} >
                <div className="bg-white" style={{ borderRadius: 5 }}>
                    <div className="title">
                        <h5 className="text-left text-uppercase p-3">
                            {trans[locate].transaction_confirmation}
                        </h5>
                        <a onClick={closeModalConfirmSwap} role="button" style={{
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
                    </div>

                    <div className="w-100 px-3 pb-3">
                        <h6 className="d-flex align-items-center gap-2" >
                            <input type="checkbox" id="rule_1" checked={isApproveRules[0]} onChange={e => onApproveRules(0, e.target.checked)} />
                            <label htmlFor="rule_1">
                                {trans[locate].you_must_have_read_and_understood_about_this_product}
                            </label>
                        </h6>
                        <h6 className="d-flex align-items-center gap-2" >
                            <input type="checkbox" id="rule_2" checked={isApproveRules[1]} onChange={e => onApproveRules(1, e.target.checked)} />
                            <label htmlFor="rule_2">
                                {trans[locate].you_agree_and_undertake_to_comply_with_the_release_and_withdrawal_policies_listed_in_the_Legal_tab}
                            </label>
                        </h6>
                        <h6 className="d-flex align-items-center gap-2" >
                            <input type="checkbox" id="rule_3" checked={isApproveRules[2]} onChange={e => onApproveRules(2, e.target.checked)} />
                            <label htmlFor="rule_3">
                                {trans[locate].you_are_solely_responsible_for_this_decision}
                            </label>
                        </h6>

                    </div>
                    <div className="p-3 pt-0">
                        <input
                            type="checkbox" checked={notViewBoxConfirm}
                            className="form-check-input"
                            id="exampleCheck1"
                            onChange={(e) => {
                                setNotViewBoxConfirm(e.target.checked);
                                localStorage.setItem(`notViewBoxConfirmSwap_buy_${props.productId}`, e.target.checked ? 'true' : 'false')
                            }}
                        />
                        <label className="form-check-label ms-2" htmlFor="exampleCheck1">
                            {trans[locate].don_t_ask_again}
                        </label>
                    </div>
                    <div className="d-flex gap-3 p-3 pt-0" >
                        <button onClick={closeModalConfirmSwap} className="btn-primary-light w-100 d-flex justify-content-center align-items-center fw-bold gap-3" style={{ backgroundColor: '#cacaca' }}>
                            <span className="" >
                                {trans[locate].disagree}
                            </span>
                        </button>
                        <button
                            onClick={() => {
                                setAgreeModalConfirm(true)
                                closeModalConfirmSwap()
                            }}
                            className="btn-primary-light w-100 d-flex justify-content-center align-items-center fw-bold gap-3"
                            disabled={isApproveRules.indexOf(false) >= 0}
                            style={{ ...isApproveRules.indexOf(false) >= 0 && { backgroundColor: '#cacaca' } }}
                        >
                            <span className="" >
                                {trans[locate].agree}
                            </span>
                        </button>
                    </div>
                </div>
            </ModalBase>

            <div className="px-2 py-2 body-tab tab-body" id="sell-section" role="tabpanel">
                {/* From */}
                <div>
                    <div className="d-flex justify-content-between px-3">
                        <div className="d-flex align-items-center gap-1 currency">
                            <img style={{ width: 25 }} src="/img/portion-icon.png" />
                            {trans[locate].portion}
                        </div>
                        <div className="balance">{trans[locate].balance}: {formatCurrency(props.balanceAsset.toString()) || 0}</div>
                    </div>
                    <input
                        value={inputAsset.toString()}
                        onFocus={() => {
                            setFocusInput('inputAsset')
                        }}
                        onChange={async (e) => {
                            let value = e.target.value.trim()
                            if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
                                setInputAsset(BigInt(0))
                                setInputStableCoin(BigInt(0))
                                return;
                            }
                            try {
                                let amount = parseFloat(e.target.value.trim())
                                setInputAsset(BigInt(amount))
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }}
                        type="text"
                        className="input-amount p-2 mt-2"
                        placeholder="0"
                        disabled={props.disabled}
                    />
                </div>
                {/* Switch */}
                <div className="d-flex justify-content-center my-4">
                    <button onClick={() => props.onChangeStatusPay()} className="btn-switch px-0">
                        <img style={{ transform: 'rotateY(180deg)' }} src="/img/switch-icon.png" />
                    </button>
                </div>
                {/* To */}
                <div>
                    <div className="d-flex justify-content-between px-3">
                        <div className="d-flex align-items-center gap-1 currency">
                            <img style={{ width: 25 }} src="/img/vnd-icon.png" />
                            VND
                        </div>
                        <div className="balance">{trans[locate].balance}: {formatCurrency((props.balanceStableCoin.toString())) || 0}đ</div>
                    </div>
                    <input
                        value={inputStableCoin.toString()}
                        onFocus={() => {
                            setFocusInput('inputStableCoin')
                        }}
                        onChange={async (e) => {
                            let value = e.target.value.trim()
                            if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
                                setInputAsset(BigInt(0))
                                setInputStableCoin(BigInt(0))
                                return;
                            }
                            try {
                                let amount = parseFloat(e.target.value.trim()).toString()
                                setInputStableCoin(BigInt(amount))
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }}
                        type="text"
                        className="input-amount p-2 mt-2"
                        placeholder="0"
                        disabled={props.disabled}
                    />
                </div>
            </div>

            {isApprove && (
                <>
                    {agreeModalConfirm || notViewBoxConfirm ? (
                        <div className="px-2 pt-3 pb-2" style={{ color: '#7e7e7e', backgroundColor: '#ebebeb4d', border: '1px solid #d1d1d1', borderTop:0, borderBottom: 0 }}>
                            <span className="me-1">
                                <i className="fa-regular fa-circle-info"></i>
                            </span>
                            <span style={{ fontStyle: 'italic' }}>
                                {trans[locate].swap_note_1}
                            </span>
                        </div>
                    ) : null}
                </>
            )}

            {authenticated && !maxPool && !isApprove && !isInsufficientBalance && priceImpact < 15 && parseInt(inputStableCoin.toString()) > 0 && (
                <>
                    {agreeModalConfirm || notViewBoxConfirm ? (
                        <div className="px-2 pt-3 pb-2" style={{ color: '#7e7e7e', backgroundColor: '#ebebeb4d', border: '1px solid #d1d1d1', borderTop:0, borderBottom: 0 }}>
                            <span className="me-1">
                                <i className="fa-regular fa-circle-info"></i>
                            </span>
                            <span style={{ fontStyle: 'italic' }}>
                                {trans[locate].swap_note_2}
                            </span>
                        </div>
                    ) : null}
                </>
            )}

            {maxPool && (
                <button disabled className="btn-pay p-2 d-flex justify-content-center align-items-center gap-3 text-uppercase fw-bold" style={{ backgroundColor: '#acacac' }}>
                    {trans[locate].over_pool_size}
                </button>
            )}

            {!maxPool && !!isInsufficientBalance && priceImpact < 15 && (
                <button disabled className="btn-pay p-2 d-flex justify-content-center align-items-center gap-3 text-uppercase fw-bold" style={{ backgroundColor: '#acacac' }}>
                    {trans[locate].insufficient_balance}
                </button>
            )}

            {!maxPool && !!isApprove && priceImpact < 15 && (
                <button onClick={() => {
                    if (!agreeModalConfirm && !notViewBoxConfirm) {
                        openModalConfirmSwap()
                    }
                    else approve()
                }} className="btn-pay p-2 d-flex justify-content-center align-items-center gap-3 text-uppercase fw-bold" disabled={parseInt(inputStableCoin.toString()) == 0 || loadingCalcSwap || loadingPriceImpact} style={{ ...parseInt(inputStableCoin.toString()) == 0 || loadingCalcSwap || loadingPriceImpact ? { backgroundColor: '#acacac' } : {} }} >
                    {!agreeModalConfirm && !notViewBoxConfirm ? trans[locate].confirm : trans[locate].approved}
                    <CircleSpinner size={15} loading={loadingApprove} />
                </button>
            )}

            {!maxPool && authenticated && !isApprove && !isInsufficientBalance && priceImpact < 15 && (
                <button onClick={() => {
                    if (!agreeModalConfirm && !notViewBoxConfirm) {
                        openModalConfirmSwap()
                    }
                    else confirm()
                }} className="btn-pay p-2 d-flex justify-content-center align-items-center gap-3 text-uppercase fw-bold" disabled={parseInt(inputStableCoin.toString()) == 0 || loadingCalcSwap || loadingPriceImpact} style={{ ...parseInt(inputStableCoin.toString()) == 0 || loadingCalcSwap || loadingPriceImpact ? { backgroundColor: '#acacac' } : {} }}>
                    {!agreeModalConfirm && !notViewBoxConfirm ? trans[locate].confirm : trans[locate].next}
                    <CircleSpinner size={15} loading={loadingConfirm} />
                </button>
            )}

            {/* No Login */}
            {!maxPool && !authenticated && (
                <button onClick={() => {
                    router.push(routeNames.login)
                }} className="btn-pay p-2 d-flex justify-content-center align-items-center gap-3 text-uppercase fw-bold">
                    {trans[locate].login}
                </button>
            )}

            {!maxPool && authenticated && priceImpact >= 15 && (
                <button disabled className="btn-pay p-2 d-flex justify-content-center align-items-center gap-3 text-uppercase fw-bold" style={{ backgroundColor: '#acacac' }}>
                    {trans[locate].impact_price_too_high}
                </button>
            )}






            {/* Box price impact */}
            {inputStableCoin != BigInt(0) || inputAsset != BigInt(0) ? (
                <div className="box-swap--sub">
                    <div className="d-flex align-items-center gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <span>{trans[locate].price_impact}: </span>
                            <span className="d-flex align-items-center gap-2">
                                {loadingPriceImpact || loadingCalcSwap || priceImpact < 0 || priceImpact > 100 ? <Skeleton count={1} style={{ width: 50 }} /> : priceImpact} <span>%</span>
                            </span>
                        </div>
                    </div>
                    <div>
                        <span>{trans[locate].liquidity_provider_fee}: </span>
                        {(parseFloat(inputStableCoin.toString()) * 0.2 / 100)} VND
                    </div>
                </div>
            ) : null}
        </>
    )
}