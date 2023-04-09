import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMetaMask } from "metamask-react";
import router from "next/router";

import { alertActions, authActions, contractActions } from "@store/actions";
import { userApi } from "@apis/index";
import { authSelector } from "@store/auth/auth.slice";
import { routeNames } from "@utils/router";
import IconMetamask from "src/resources/icons/metamask";
import RegBtnSubmit from "./btn_submit";
import { contractSelector } from "@store/contract/contract.slice";
import { trans } from "src/resources/trans";
import { locateSelector } from "@store/locate/locate.slice";



export default function RegPageMetamask() {

    const dispatch = useDispatch()
    const { status, connect, account, chainId, ethereum } = useMetaMask();
    const { web3Contract, infoContract } = useSelector(contractSelector)
    const { locate } = useSelector(locateSelector)
    const { userResiger } = useSelector(authSelector)


    const [loadingNext, setLoadingNext] = useState(false)
    const [loadingMetamask, setLoadingMetamask] = useState(false)
    const [msgErrors, setMsgErrors] = useState({})
    const [isNext, setIsNext] = useState(false)
    const [loadingSkip, setLoadingSkip] = useState(false)

    useEffect(() => {
        if (status == "connecting") setLoadingMetamask(true)
        else setLoadingMetamask(false)

    }, [status])


    const registerAccountContract = async () => {
        console.log("register -> registerAccountContract")
        setMsgErrors({})
        setLoadingNext(true)
        try {
            await web3Contract.accountManagement.methods.accRegistrate(userResiger.phoneNumber).send({from: account})
            await userApi.userUpdateWallet({ walletAddress: account.toLowerCase(), chainId })
            dispatch(authActions.self.verifyWalletSuccess({
                addressWallel: account.toLowerCase(), chainId
            }))
            setIsNext(true);

            dispatch(authActions.nextStepRegister())
        }
        catch (e) {
            setLoadingNext(false); setMsgErrors({ ...msgErrors, next: "connect_fail_please_try_again" }); setIsNext(false); setLoadingMetamask(false)
            setIsNext(false);
            setLoadingNext(false);
            setLoadingNext(false);
            setLoadingMetamask(false);
        }
    }


    return (
        <div className="d-flex flex-column align-items-center justify-content-start w-100" style={{ maxWidth: 700, minHeight: 500 }} >

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

            <div className="title">
                <h5 className="text-center text-uppercase">
                    {trans[locate].verify_your_bep20_address}
                </h5>
            </div>

            <div className="mt-4 w-100">

                {status !== 'connected' ? (
                    <div style={{ maxWidth: 350 }} className="mx-auto d-none d-xl-block">
                        <RegBtnSubmit
                            onClick={() => {
                                if (status == 'unavailable') {
                                    dispatch(alertActions.reWarnEnableMetamask(trans[locate].you_need_install_metamask))
                                }
                                else {
                                    connect()
                                }
                            }}
                            type="next"
                            title={trans[locate].connect_BEP20_wallet}
                            style={{ position: 'relative', maxWidth: '100%' }}
                            icon={(<IconMetamask width={40} height={40} style={{
                                position: "absolute",
                                top: '50%',
                                transform: 'translateY(-50%)',
                                left: 15
                            }} />)}
                            loading={loadingMetamask}
                        />
                    </div>
                ) : (
                    <div className="text-center d-none d-xl-block">
                        <h6 style={{ color: '#00954A' }} className="mt-2 mb-2"> <i className="fa-solid fa-circle-check"></i> {trans[locate].connect_success}</h6>
                        <h6 style={{ color: '#00954A' }} className="mt-0">{trans[locate].your_address}: {account}</h6>
                    </div>
                )}

                {status == 'connected' && (
                    <div className="d-flex justify-content-center mt-5 flex-column align-items-center d-none d-xl-block">
                        <RegBtnSubmit onClick={() => {
                            setMsgErrors({})
                            if (isNext)
                                dispatch(authActions.nextStepRegister())
                            else {
                                registerAccountContract()
                            }
                        }} type="next" title={trans[locate].verify} loading={loadingNext} />
                        <h6 className="text-center mt-2" >{trans[locate].please_verify_wallet_to_securely_store_and_trade_your_assets}!</h6>
                        {msgErrors['next'] && <h6 className="auth-page--input-message-error text-center">{trans[locate][msgErrors['next']]}</h6>}

                    </div>
                )}

                <h6 className="d-blocl d-xl-none text-center" > <i style={{ color: '#E9B261' }} className="fa-solid fa-circle-exclamation"></i> {trans[locate].this_function_is_only_excuted_on_desktops}</h6>

                <div className="mt-4">
                    <RegBtnSubmit onClick={() => {
                        dispatch(authActions.nextStepRegister())
                    }} type="next" title={trans[locate].skip} loading={loadingSkip} />
                </div>

            </div>
        </div>
    )
}