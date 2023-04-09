import { useMetaMask } from "metamask-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { Contract } from "web3-eth-contract";
import _ from "lodash";
import Web3 from "web3";
import { CircleSpinner } from "react-spinners-kit";
import { useRouter } from "next/router";
import { LoadingOutlined } from '@ant-design/icons';


import { alertActions, contractActions } from "@store/actions";
import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { trans } from "src/resources/trans";
import { contractSelector } from "@store/contract/contract.slice";
import { divValueBlock, formatCurrency } from "@utils/number";
import ModalBase from "@components/modal";
import { routeNames } from "@utils/router";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import { Spin, Tabs } from "antd";
import BuySwap from "./buy_swap";
import SellSwap from "./sell_swap";
import { parseErrorWeb3 } from "@utils/functions";

interface IProps {
    product: RealEstateAssetView,
    onConfirmSuccess: () => void,
    loading: boolean,
    onUpdatePrice: (price: number) => void
}

export default function BoxSwap({
    loading,
    product,
    onConfirmSuccess,
    onUpdatePrice
}: IProps) {
    const dispatch = useDispatch()
    const { authenticated, user } = useSelector(authSelector)
    const {
        infoContract,
        web3Contract,
        loadedInfoContracts,
        web3
    } = useSelector(contractSelector)
    const router = useRouter()
    const [statusPayForm, setStatusPayForm] = useState<'buy' | 'sell'>('buy')
    const [tokenContract, setTokenContract] = useState<Contract>()
    const [assetContract, setAssetContract] = useState<Contract>()

    const { locate, locations } = useSelector(locateSelector)

    const [balanceOfToken, setBalanceOfToken] = useState(0)
    const [balanceOfAsset, setBalanceOfAsset] = useState(0)

    const [disabledSwap, setDisabledSwap] = useState(true)



    const [PATH, setPATH] = useState(['', ''])
    const [PATH_ASSET_VND, setPATH_ASSET_VND] = useState(PATH)

    useEffect(() => {
        if (product.digitalInfo.assetAddress && loadedInfoContracts) {
            setPATH([product.digitalInfo.assetAddress, infoContract.stableCoin.address].reverse())
            setPATH_ASSET_VND([product.digitalInfo.assetAddress, infoContract.stableCoin.address])
        }
    }, [product, loadedInfoContracts])

    const swapMethodPay = () => {
        if (statusPayForm == 'buy')
            setStatusPayForm('sell')
        else setStatusPayForm('buy')
    }


    useEffect(() => {
        if (!!web3 && product.digitalInfo.assetAddress && infoContract.stableCoin.address && loadedInfoContracts && web3Contract.pancakeRouter) {
            setTokenContract(web3Contract.stableCoin)
            setAssetContract(
                new web3.eth.Contract(JSON.parse(infoContract.asset.abi), product.digitalInfo.assetAddress) as any
            )
        }
    }, [product, loadedInfoContracts, web3])


    useEffect(() => {
        (async () => {
            if (!!tokenContract && user.walletAddress) {
                let balanceOfToken = await tokenContract.methods.balanceOf(user.walletAddress).call()
                setBalanceOfToken(balanceOfToken)
            }
        })()
    }, [tokenContract, user])

    useEffect(() => {
        (async () => {
            if (!!assetContract && user.walletAddress && web3) {
                let balanceOfAsset = await assetContract.methods.balanceOf(user.walletAddress).call()
                setBalanceOfAsset(balanceOfAsset)
            }
        })()

    }, [assetContract, user, web3])


    const [pairAddress, setPairAddress] = useState('')
    const [maxPoolAsset, setMaxPoolAsset] = useState(0)
    const [maxPoolStableCoin, setMaxPoolStableCoin] = useState(0)
    const getPair = async () => {
        let factoryContract = new web3.eth.Contract(JSON.parse(infoContract.pancakeFactory.abi), infoContract.pancakeFactory.address)

        let pairAddress = await factoryContract.methods.getPair(
            infoContract.stableCoin.address,
            product.digitalInfo.assetAddress
        ).call()

        await getPoolSize(pairAddress)

        setPairAddress(pairAddress)
    }

    const getPoolSize = async (pairAddress: string) => {
        let pairOfStableCoin = await tokenContract.methods.balanceOf(pairAddress).call()
        setMaxPoolStableCoin(parseFloat(pairOfStableCoin))
        let pairOfAsset = await assetContract.methods.balanceOf(pairAddress).call()
        setMaxPoolAsset(parseFloat(pairOfAsset))
    }

    const balanceCurMVND = async () => {
        if (!!tokenContract) {
            let balance = await tokenContract.methods.balanceOf(pairAddress).call()
            return parseFloat(balance)
        }
        else return 0
    }

    const balanceCurAsset = async () => {
        if (!!assetContract) {
            let balance = await assetContract.methods.balanceOf(pairAddress).call()
            return parseFloat(balance)
        }
        else return 0
    }

    useEffect(() => {
        (async () => {
            if (infoContract.stableCoin.address && product.digitalInfo.assetAddress && loadedInfoContracts && web3 && tokenContract && assetContract) {
                await getPair()
                await checkPriceAvailable(product.digitalInfo.assetAddress)
            }
        })()
    }, [product, loadedInfoContracts, web3, assetContract])


    const refreshBalanceStableCoinAndAsset = async () => {
        // console.log("assetContract.methods.balanceOf: ",await assetContract.methods.balanceOf(user.walletAddress.toLowerCase()).call())
        setBalanceOfAsset(await assetContract.methods.balanceOf(user.walletAddress.toLowerCase()).call())
        setBalanceOfToken(await tokenContract.methods.balanceOf(user.walletAddress.toLowerCase()).call())
    }

    const checkPriceAvailable = async (assetAddress: string) => {
        try {
            setDisabledSwap(true)
            let price = await web3Contract.pancakeRouter.methods.getAmountsIn(
                "1",
                [assetAddress, infoContract.stableCoin.address].reverse()
            ).call()
            onUpdatePrice(parseFloat(price))
            setDisabledSwap(false)
        }
        catch (err) {
            // console.log("🚀 ~ file: [id].tsx:514 ~ getUnitPrice ~ err", err)
            let error = parseErrorWeb3(err.message)
            if (error?.message == 'execution reverted' || err?.message == 'Returned error: execution reverted') {
                setDisabledSwap(true)
            }
            else {
                // Oops 
            }
        }
    }

    return (
        <>
            <div className="mt-2" style={{ position: 'relative' }}>
                <div className="overflow-hidden payment">
                    <Tabs defaultActiveKey="buy" activeKey={statusPayForm} onChange={value=>{
                        setStatusPayForm(value as any)
                    }} >
                        <Tabs.TabPane tab={trans[locate].buy} key="buy">
                            <div className="tab-content">
                                <BuySwap
                                    onChangeStatusPay={() => swapMethodPay()}
                                    balanceAsset={balanceOfAsset}
                                    balanceStableCoin={balanceOfToken}
                                    productId={product?._id}
                                    assetAddress={product?.digitalInfo?.assetAddress}
                                    balanceCurAsset={balanceCurAsset}
                                    balanceCurStableCoin={balanceCurMVND}
                                    maxPoolAsset={maxPoolAsset}
                                    maxPoolStableCoin={maxPoolStableCoin}
                                    PATH={PATH}
                                    onConfirmSuccess={async () => {
                                        onConfirmSuccess()
                                        // refresh balance
                                        await refreshBalanceStableCoinAndAsset()
                                        // load pool size
                                        await getPoolSize(pairAddress)
                                    }}
                                    disabled={disabledSwap}
                                />
                            </div>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={trans[locate].sell} key="sell">
                        <div className="tab-content">
                                <SellSwap
                                    onChangeStatusPay={() => swapMethodPay()}
                                    balanceAsset={balanceOfAsset}
                                    balanceStableCoin={balanceOfToken}
                                    productId={product?._id}
                                    assetAddress={product?.digitalInfo?.assetAddress}
                                    balanceCurAsset={balanceCurAsset}
                                    balanceCurStableCoin={balanceCurMVND}
                                    maxPoolAsset={maxPoolAsset}
                                    maxPoolStableCoin={maxPoolStableCoin}
                                    PATH={PATH_ASSET_VND}
                                    onConfirmSuccess={async () => {
                                        onConfirmSuccess()
                                        // refresh balance
                                        await refreshBalanceStableCoinAndAsset()
                                        // load pool size
                                        await getPoolSize(pairAddress)
                                    }}
                                    assetContract={assetContract}
                                    disabled={disabledSwap}
                                />
                            </div>
                        </Tabs.TabPane>
                    </Tabs>
                </div>
                

            

                {/* {payFormBuy.vnd != BigInt(0) || payFormSell.vnd != BigInt(0) ? (
                    <div className="box-swap--sub">
                        <div className="d-flex align-items-center gap-2">
                            <div>
                                <span>{trans[locate].price_impact}: </span>
                                <span>
                                    {statusPayForm == 'buy' ?
                                        priceImpactMVND :
                                        priceImpactAsset} %
                                </span>
                            </div>
                        </div>
                        <div>
                            <span>{trans[locate].liquidity_provider_fee}: </span>
                            {statusPayForm == 'buy' ?
                                `${(parseFloat(payFormBuy.vnd.toString()) * 0.2 / 100)} VND` :
                                `${(parseFloat(payFormSell.token.toString()) * 0.2 / 100)} ${product.digitalInfo.assetSymbol[locate]}`
                            }
                        </div>
                    </div>
                ) : null} */}
            </div>
        </>
    )
}