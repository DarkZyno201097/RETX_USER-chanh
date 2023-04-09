import { useEffect, useState } from "react"
import { useMetaMask } from "metamask-react"
import { useDispatch, useSelector } from "react-redux"

import { alertActions, authActions, contractActions } from "@store/actions"
import { userApi } from "@apis/index"
import RegBtnSubmit from "@components/register/btn_submit"
import { authSelector } from "@store/auth/auth.slice"
import { contractSelector } from "@store/contract/contract.slice"
import { locateSelector } from "@store/locate/locate.slice"
import IconMetamask from "src/resources/icons/metamask"
import { trans } from "src/resources/trans"



interface IProps {
    onDone: () => void
}

export default function LinkVerifyAddress({ onDone }: IProps) {
    const dispatch = useDispatch()
    const { locate } = useSelector(locateSelector)
    const { status, connect, account, chainId, ethereum } = useMetaMask();
    const { web3Contract, web3, infoContract } = useSelector(contractSelector)
    const { user } = useSelector(authSelector)


    const [loadingNext, setLoadingNext] = useState(false)
    const [loadingMetamask, setLoadingMetamask] = useState(false)
    const [msgErrors, setMsgErrors] = useState({})
    const [isNext, setIsNext] = useState(false)
    const [loadingSkip, setLoadingSkip] = useState(false)

    useEffect(() => {
        setLoadingMetamask(false)
        setLoadingNext(false)
        setLoadingSkip(false)
        setMsgErrors({})
    }, [])


    const registerAccountContract = async () => {
        setMsgErrors({})
        setLoadingNext(true)
        // console.log('registerAccount: ', account, user.phoneNumber)
        try {
            await web3Contract.accountManagement.methods.accRegistrate(user.phoneNumber).send({from: account});
            await userApi.userUpdateWallet({ walletAddress: account, chainId })
            dispatch(authActions.self.verifyWalletSuccess({
                addressWallel: account, chainId
            }))
            setIsNext(true);
            onDone();
        }
        catch (e) {
            console.log(e)
            setIsNext(false);
            setMsgErrors({ ...msgErrors, next: "connect_fail_please_try_again" }); setIsNext(false); setLoadingMetamask(false)
        }
        finally {
            setLoadingNext(false);
            setLoadingMetamask(false);
        }
    }


    return (
        <div className="bg-white">
            <div className="title">
                <h5 className="text-center text-uppercase">
                    {trans[locate].verify_your_bep20_address}
                </h5>
            </div>

            <div className="mt-4 w-100">

                {status !== 'connected' || account.toLowerCase() != user.walletAddress.toLowerCase() && user.walletAddress ? (
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

                        {!!user?.walletAddress.toLowerCase() && !!account?.toLowerCase() && account?.toLowerCase() != user.walletAddress.toLowerCase() && (
                            <h6 className="text-danger text-center mt-1" >{trans[locate].the_address_not_match_the_registered_account_address}</h6>
                        )}
                    </div>
                ) : (
                    <div className="text-center d-none d-xl-block">
                        <h6 style={{ color: '#00954A' }} className="mt-2 mb-2"> <i className="fa-solid fa-circle-check"></i> {trans[locate].connect_success}</h6>
                        <h6 style={{ color: '#00954A' }} className="mt-0">{trans[locate].your_address}: {account}</h6>
                    </div>
                )}

                {status == 'connected' && account.toLowerCase() == user.walletAddress.toLowerCase() || !user.walletAddress && (
                    <div className="justify-content-center mt-5 flex-column align-items-center d-none d-xl-flex">
                        <RegBtnSubmit onClick={() => {
                            setMsgErrors({})
                            registerAccountContract()
                        }} type="next" title={trans[locate].verify} loading={loadingNext} />
                        <h6 className="text-left mt-1 fs-6 d-flex gap-2" style={{ width: 350 }} >
                            {/* <i className="fa-solid fa-circle-check" style={{lineHeight: 1.3}}></i> */}
                            <p className="text-center">{trans[locate].please_verify_wallet_to_securely_store_and_trade_your_assets}!</p>
                        </h6>
                        {msgErrors['next'] && <h6 className="auth-page--input-message-error text-center">{trans[locate][msgErrors['next']]}</h6>}

                    </div>
                )}

                <h6 className="d-blocl d-xl-none text-center" > <i style={{ color: '#E9B261' }} className="fa-solid fa-circle-exclamation"></i> {trans[locate].this_function_is_only_excuted_on_desktops}</h6>

            </div>
        </div>
    )
}