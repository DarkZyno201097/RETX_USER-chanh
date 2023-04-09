import { assetApi } from "@apis/index";
import { alertActions } from "@store/actions";
import { authSelector } from "@store/auth/auth.slice";
import { contractSelector } from "@store/contract/contract.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { routeNames } from "@utils/router";
import { Popconfirm, Select } from "antd";
import axios from "axios";
import { useMetaMask } from "metamask-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import { Locations } from "src/models/locations.model";
import { InfoCmd, InfoNftToken } from "src/models/nft.model";
import { trans } from "src/resources/trans";
import { Contract } from "web3-eth-contract";
import AcceptNegotiateNFTModal from "./modal/accept-neg";
import AcceptSellNFTModal from "./modal/accept-sell";
import InfoOwnerNFTModal from "./modal/info-owner";
import RevokeNegotiateNFTModal from "./modal/revoke-neg";
import RevokeSellNFTModal from "./modal/revoke-sell";
import SubmitNegotiateNFTModal from "./modal/submit-neg";
import SubmitSellNFTModal from "./modal/submit-sell";
import SuccessModal from "./modal/success";
import NegotiateListCollection from "./neg_list";

interface IProps {
    asset: RealEstateAssetView,
    onChangeNftIdSelected: (value: number) => void
}

export default function BoxTradeCollection({
    asset,
    onChangeNftIdSelected
}: IProps) {
    const dispatch = useDispatch()
    const {
        web3,
        infoContract,
        web3Contract,
        loadedInfoContracts,
        balance
    } = useSelector(contractSelector)
    const router = useRouter()
    const { account, status } = useMetaMask()
    const { user, authenticated } = useSelector(authSelector)
    const { locations, locate } = useSelector(locateSelector)
    const [contractCollection, setContractCollection] = useState<Contract>(null)
    const [totalSupply, setTotalSupply] = useState(0)
    const [nftIdSelected, setNftIdSelected] = useState(null)
    const [info, setInfo] = useState({
        name: "",
        symbol: "",
        image: "",
        description: ""
    })
    const [loadingInfo, setLoadingInfo] = useState(false)
    const [isOwnNFT, setIsOwnNFT] = useState(false)
    const [infoSellCmd, setInfoSellCmd] = useState(new InfoCmd())
    const [visibleSubmitSellModal, setVisibleSubmitSellModal] = useState(false)
    const [visibleSuccessModal, setVisibleSuccessModal] = useState(false)
    const [transactionHash, setTransactionHash] = useState('')
    const [visibleRevokeSellModal, setVisibleRevokeSellModal] = useState(false)
    const [visibleAcceptNegModal, setVisibleAcceptNegModal] = useState(false)
    const [negIndex, setNegIndex] = useState(null)
    const [infoNegCmd, setInfoNegCmd] = useState(new InfoCmd())
    const [visibleSubmitNegModal, setVisibleSubmitNegModal] = useState(false)
    const [visibleRevokeNegSubmit, setVisibleRevokeNegSubmit] = useState(false)
    const [submittedNeg, setSubmittedNeg] = useState<InfoCmd>(null)
    const [visibleAcceptSellModal, setVisibleAcceptSellModal] = useState(false)
    const [visibleInfoOwnerModal, setVisibleInfoOwnerModal] = useState(false)
    const [checkingSubmittedNeg, setCheckingSubmittedNeg] = useState(false)

    useEffect(() => {
        // init load
        (async () => {
            if (
                infoContract.collection.abi &&
                web3 &&
                asset.digitalInfo.assetAddress &&
                web3Contract.nftManagement &&
                !info.name
            ) {
                // contract collection
                let _contractCollection = new web3.eth.Contract(JSON.parse(infoContract.collection.abi), asset.digitalInfo.assetAddress)
                setContractCollection(_contractCollection as any)

                // get total supply
                let _totalSupply = await _contractCollection.methods.totalSupply().call()
                if (_totalSupply > 0) {
                    setNftIdSelected(1)
                    onChangeNftIdSelected(1)
                }
                setTotalSupply(parseInt(_totalSupply))
            }
        })()
    }, [infoContract, web3, asset])

    useEffect(() => {
        (async () => {
            if (contractCollection && nftIdSelected > 0) {
                // get info NFT
                setCheckingSubmittedNeg(true)
                await getInfoNftId(nftIdSelected)
            }
        })()
    }, [contractCollection, nftIdSelected])

    const getInfoSellCmd = async (id: number) => {
        try {
            let value: any = await web3Contract.nftExchange.methods.sellCmd_getInfo(asset.digitalInfo.assetAddress, id).call()
            let info = new InfoCmd(value)
            console.log("🚀 ~ file: box_trade.tsx:105 ~ getInfoSellCmd ~ info:", info)
            setInfoSellCmd(info)

            // check asset on sell
            if (info.is_open && info.maker.toLowerCase() == user.walletAddress.toLowerCase()) {
                setIsOwnNFT(true)
            }
            else {
                await checkIsOwn(id)
            }
        }
        catch (err) {
            console.log("🚀 ~ file: box_trade.tsx:116 ~ getInfoSellCmd ~ err:", err)
        }
    }

    const checkIsOwn = async (id: number) => {
        try {
            let owner: string = await contractCollection.methods.ownerOf(id).call()
            setIsOwnNFT(owner.toLowerCase() == user.walletAddress.toLowerCase())
        }
        catch (err) {
            console.log("🚀 ~ file: box_trade.tsx:128 ~ checkIsOwn ~ err:", err)
            setIsOwnNFT(false)
        }
    }

    const getInfoNftId = async (id: number) => {
        try {
            setLoadingInfo(true)
            let nftUri = await contractCollection.methods.tokenURI(id).call()
            let { data } = await assetApi.pinataURI(nftUri.split('://')[1])
            let infoNft = new InfoNftToken(data)

            setInfo({
                name: infoNft.name,
                symbol: asset.digitalInfo.assetSymbol['vi'],
                image: `https://${process.env.GATEWAY_PINATA}/ipfs/${infoNft.image.split('://')[1]}`,
                description: infoNft.description
            })
        }
        catch (error) {
            console.log("🚀 ~ file: box_trade.tsx:85 ~ getInfoNftId ~ error:", error)
            setInfo({
                name: 'N/A',
                symbol: asset.digitalInfo.assetSymbol['vi'],
                image: `#`,
                description: "N/A"
            })
        }
        finally {
            await getInfoSellCmd(id)
            setLoadingInfo(false)
        }
    }

    const isAuthenticated = (noAlert?: boolean) => {
        if (window.innerWidth < 992) {
            !noAlert && dispatch(alertActions.alertError(trans[locate].this_feature_is_only_operated_on_the_computer))
        }
        else if (!authenticated) {
            !noAlert && dispatch(alertActions.alertError(trans[locate].you_need_to_sign_in))
            return false
        }
         else if (!user.hasUploadedKyc || user.kycStatus == "reject") {
            !noAlert && dispatch(alertActions.alertError(trans[locate].you_need_KYC_erification_to_be_able_to_make_transactions))
            return false
        }
        else if (user.kycStatus == 'pending' && !!user.hasUploadedKyc) {
            !noAlert && dispatch(alertActions.alertError(trans[locate].we_are_verifying_your_information_please_return_to_trading_in_24h))
            return false
        }
        else if (status == 'unavailable') {
            !noAlert && dispatch(alertActions.alertError(trans[locate].you_need_install_metamask))
            return false
        }
        else if (status != 'connected') {
            !noAlert && dispatch(alertActions.alertError(trans[locate].you_need_to_connect_the_wallet))
            return false
        }
        else if (!user.walletAddress) {
            !noAlert && dispatch(alertActions.alertError(trans[locate].you_need_to_verify_wallet))
            return false
        }
        else if (user.walletAddress.toLowerCase() != account.toLowerCase()) {
            !noAlert && dispatch(alertActions.addressConnectedNotMatch({
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


    const copy = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <>
            {/* Modal */}
            <SuccessModal
                onCancel={() => {
                    setVisibleSuccessModal(false)
                    setTransactionHash("")
                }}
                visible={visibleSuccessModal}
                transactionHash={transactionHash}
            />

            {/* Bán */}
            <SubmitSellNFTModal
                visible={visibleSubmitSellModal}
                onCancel={() => {
                    setVisibleSubmitSellModal(false)
                }}
                assetName={info.name}
                assetAddress={asset.digitalInfo.assetAddress}
                assetLocation={locations.getFull(
                    asset.additionalInfo.location.cityCode,
                    asset.additionalInfo.location.districtCode,
                    asset.additionalInfo.location.wardCode,
                )}
                assetImage={info.image}
                numberNFT={nftIdSelected}
                contractCollection={contractCollection}
                onSuccess={({ transactionHash }) => {
                    console.log("🚀 ~ file: box_trade.tsx:333 ~ transactionHash:", transactionHash)
                    setVisibleSubmitSellModal(false);
                    getInfoNftId(nftIdSelected)

                    setTransactionHash(transactionHash)
                    setVisibleSuccessModal(true)
                }}
            />

            {/* Huỷ bán */}
            <RevokeSellNFTModal
                visible={visibleRevokeSellModal}
                onCancel={() => {
                    setVisibleRevokeSellModal(false)
                }}
                assetId={asset._id}
                assetName={info.name}
                assetAddress={asset.digitalInfo.assetAddress}
                assetLocation={locations.getFull(
                    asset.additionalInfo.location.cityCode,
                    asset.additionalInfo.location.districtCode,
                    asset.additionalInfo.location.wardCode,
                )}
                assetImage={info.image}
                numberNFT={nftIdSelected}
                infoSellCmd={infoSellCmd}
                onSuccess={({ transactionHash }) => {
                    setVisibleRevokeSellModal(false);
                    getInfoNftId(nftIdSelected)

                    setTransactionHash(transactionHash)
                    setVisibleSuccessModal(true)
                }}
            />

            {/* Đồng ý bán với giá đề nghị */}
            <AcceptNegotiateNFTModal
                visible={visibleAcceptNegModal}
                onCancel={() => {
                    setVisibleAcceptNegModal(false)
                }}
                assetId={asset._id}
                assetName={info.name}
                assetAddress={asset.digitalInfo.assetAddress}
                assetLocation={locations.getFull(
                    asset.additionalInfo.location.cityCode,
                    asset.additionalInfo.location.districtCode,
                    asset.additionalInfo.location.wardCode,
                )}
                assetImage={info.image}
                numberNFT={nftIdSelected}
                infoNegCmd={infoNegCmd}
                negIndex={negIndex}
                priceOnSell={infoSellCmd.price}
                onSuccess={({ transactionHash }) => {
                    setVisibleAcceptNegModal(false);
                    getInfoNftId(nftIdSelected)

                    setTransactionHash(transactionHash)
                    setVisibleSuccessModal(true)
                }}
                contractCollection={contractCollection}
            />

            {/* Huỷ trả giá */}
            <RevokeNegotiateNFTModal
                visible={visibleRevokeNegSubmit}
                onCancel={() => {
                    setVisibleRevokeNegSubmit(false)
                }}
                assetName={info.name}
                assetAddress={asset.digitalInfo.assetAddress}
                assetLocation={locations.getFull(
                    asset.additionalInfo.location.cityCode,
                    asset.additionalInfo.location.districtCode,
                    asset.additionalInfo.location.wardCode,
                )}
                assetImage={info.image}
                numberNFT={nftIdSelected}
                infoNegCmd={infoNegCmd}
                onSuccess={({ transactionHash }) => {
                    setVisibleRevokeNegSubmit(false);
                    getInfoNftId(nftIdSelected)

                    setTransactionHash(transactionHash)
                    setVisibleSuccessModal(true)
                }}
            />

            {/* Trả giá */}
            <SubmitNegotiateNFTModal
                visible={visibleSubmitNegModal}
                onCancel={() => {
                    setVisibleSubmitNegModal(false)
                }}
                assetName={info.name}
                assetAddress={asset.digitalInfo.assetAddress}
                assetLocation={locations.getFull(
                    asset.additionalInfo.location.cityCode,
                    asset.additionalInfo.location.districtCode,
                    asset.additionalInfo.location.wardCode,
                )}
                assetImage={info.image}
                numberNFT={nftIdSelected}
                infoSellCmd={infoSellCmd}
                contractCollection={contractCollection}
                onSuccess={({ transactionHash }) => {
                    setVisibleSubmitNegModal(false);
                    getInfoNftId(nftIdSelected)

                    setTransactionHash(transactionHash)
                    setVisibleSuccessModal(true)
                }}
            />

            {/* Mua */}
            <AcceptSellNFTModal
                visible={visibleAcceptSellModal}
                onCancel={() => {
                    setVisibleAcceptSellModal(false)
                }}
                assetId={asset._id}
                assetName={info.name}
                assetAddress={asset.digitalInfo.assetAddress}
                assetLocation={locations.getFull(
                    asset.additionalInfo.location.cityCode,
                    asset.additionalInfo.location.districtCode,
                    asset.additionalInfo.location.wardCode,
                )}
                numberNFT={nftIdSelected}
                infoSellCmd={infoSellCmd}
                contractCollection={contractCollection}
                onSuccess={({ transactionHash }) => {
                    setVisibleAcceptSellModal(false);
                    getInfoNftId(nftIdSelected)

                    setTransactionHash(transactionHash)
                    setVisibleSuccessModal(true)
                }}
                assetImage={info.image}

            />

            {/* Liên hệ chủ sở hữu */}
            <InfoOwnerNFTModal
                visible={visibleInfoOwnerModal}
                onCancel={() => {
                    setVisibleInfoOwnerModal(false)
                }}
                assetName={info.name}
                assetImage={info.image}
                assetLocation={locations.getFull(
                    asset.additionalInfo.location.cityCode,
                    asset.additionalInfo.location.districtCode,
                    asset.additionalInfo.location.wardCode,
                )}
                numberNFT={nftIdSelected}
                contractCollection={contractCollection}
                isOpenOnSell={infoSellCmd.is_open}
                addressMarker={infoSellCmd.maker}
            />

            {/* End Modal */}


            <div className="collection-box-trade">
                <div className="head">
                    <span className="head-name">
                        {trans[locate].product}
                    </span>
                    <div className="stt">
                        <span className="name me-2">
                            {trans[locate].numerical_order}
                        </span>
                        <Select
                            showSearch
                            style={{ width: 100, color: 'red', borderColor: '#C4C4C4' }}
                            placeholder={trans[locate].choose || ''}
                            optionFilterProp="children"
                            filterOption={(input, option) => (option?.label ?? '').includes(input)}
                            options={Array.from({ length: totalSupply }, (_, index) => index + 1).map((item) => {
                                return {
                                    value: item,
                                    label: item.toString()
                                }
                            })}
                            value={nftIdSelected}
                            onChange={(value) => {
                                setNftIdSelected(value)
                                getInfoNftId(value)
                                onChangeNftIdSelected(value)
                            }}
                            loading={loadingInfo}
                        />

                    </div>
                </div>
                {nftIdSelected > 0 && (
                    <div className="content" style={{ ...loadingInfo ? { display: 'none' } : { display: 'block' } }}>
                        <div className="d-flex justify-content-between item">
                            <span className="name" style={{ width: '40%' }}>
                                {trans[locate].product_name}
                            </span>
                            <div className="d-flex gap-2 justify-content-end" style={{ width: '60%' }}>
                                <span>#{info.symbol}</span>
                                <span>{info.name}</span>
                                <a href={info.image} target={'_blank'} role={'button'}>
                                    <i className="fa-regular fa-image"></i>
                                </a>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between item">
                            <span className="name" style={{ width: '40%' }}>
                                {trans[locate].description}
                            </span>
                            <span className="text-end" style={{ width: '60%' }}>
                                {info.description}
                            </span>
                        </div>
                        {/* Sở hữu nhưng CHƯA rao bán */}
                        {isOwnNFT && !infoSellCmd.is_open && (
                            <>
                                <div className="d-flex flex-column item">
                                    <div>
                                        <h5 className="text-own m-0">
                                            {trans[locate].do_you_own_this_product}
                                        </h5>
                                        <span className="sub">
                                            <i>{trans[locate].you_have_not_posted_this_product_for_sale_yet}</i>
                                        </span>
                                    </div>
                                    <div className="mt-3">
                                        <button
                                            onClick={() => {
                                                isAuthenticated() && setVisibleSubmitSellModal(true)
                                            }}
                                            className="btn btn-orange"
                                        >
                                            {trans[locate].sell_now}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Sở hữu nhưng ĐANG rao bán */}
                        {isOwnNFT && infoSellCmd.is_open && (
                            <div className="d-flex flex-column item">
                                <div>
                                    <span className="name" style={{ width: '40%' }}>
                                        {trans[locate].price}
                                    </span>
                                    <h3 className="price m-0">
                                        {(infoSellCmd.price).toLocaleString('vi-VN')} VND
                                    </h3>
                                    <span className="sub">
                                        <i style={{ color: '#3EAFFF' }}>
                                            {trans[locate].you_are_selling_this_product}
                                        </i>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => {
                                            isAuthenticated() && setVisibleRevokeSellModal(true)
                                        }}
                                        className="btn btn-orange-light"
                                    >
                                        {trans[locate].cancel_sale}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* KHÔNG sở hữu nhưng ĐANG rao bán */}
                        {!isOwnNFT && infoSellCmd.is_open && (
                            <>
                                <div className="d-flex justify-content-between item">
                                    <span className="name" style={{ width: '40%' }}>
                                        {trans[locate].owner}:
                                    </span>
                                    <span className="d-flex gap-2 justify-content-end" style={{ width: '60%' }}>
                                        <a role='button' onClick={() => { setVisibleInfoOwnerModal(true) }} style={{ color: '#34306A' }}>
                                            {infoSellCmd.maker.slice(0, 4)}...{infoSellCmd.maker.slice(-4)}
                                        </a>
                                        <a onClick={() => {
                                            copy(infoSellCmd.maker)
                                        }} role={'button'}>
                                            <i className="fa-regular fa-copy"></i>
                                        </a>
                                    </span>
                                </div>

                                <div className="d-flex flex-column item">
                                    <div>
                                        <span className="name" style={{ width: '40%' }}>
                                            {trans[locate].price}
                                        </span>
                                        <h3 className="price m-0">
                                            {(infoSellCmd.price).toLocaleString('vi-VN')} VND
                                        </h3>
                                    </div>
                                    <div className="mt-3 d-flex gap-3">
                                        {balance < infoSellCmd.price && isAuthenticated(true) ? (
                                            <Popconfirm
                                                title={`${trans[locate].your_balance_is_not_enough_do_you_want_to_top_up_to_continue}?`}
                                                onConfirm={() => {
                                                    router.push(`${routeNames.profile}?tab=deposit_withdraw`)
                                                }}
                                                okText={trans[locate].yes}
                                                cancelText={trans[locate].no}
                                            >
                                                <button className="btn btn-orange" >
                                                    {trans[locate].buy_now}
                                                </button>
                                            </Popconfirm>
                                        ) : (
                                            <button onClick={() => {
                                                isAuthenticated() && setVisibleAcceptSellModal(true)
                                            }} className="btn btn-orange" >
                                               {trans[locate].buy_now}
                                            </button>
                                        )}

                                        {submittedNeg?.maker ? (
                                            <Popconfirm
                                                title={`${trans[locate].you_have_made_an_offer_do_you_want_to_cancel_to_continue}?`}
                                                onConfirm={() => {
                                                    if (isAuthenticated()) {
                                                        setVisibleRevokeNegSubmit(true)
                                                        setInfoNegCmd(submittedNeg)
                                                    }
                                                }}
                                                // onCancel={cancel}
                                                okText={trans[locate].yes}
                                                cancelText={trans[locate].no}
                                            >
                                                <button className="btn btn-orange-light" style={{width: 200}} >
                                                    {trans[locate].offer_to_negotiate}
                                                </button>
                                            </Popconfirm>
                                        ) : (
                                            <button onClick={() => {
                                                isAuthenticated() && setVisibleSubmitNegModal(true)

                                            }} className="btn btn-orange-light" style={{width: 200}} disabled={checkingSubmittedNeg} >
                                                    {trans[locate].offer_to_negotiate}
                                            </button>
                                        )}

                                    </div>
                                </div>
                            </>
                        )}

                        {/* KHÔNG sở hữu nhưng KHÔNG rao bán */}
                        {!isOwnNFT && !infoSellCmd.is_open && (
                            <div className="d-flex flex-column item">
                                <div>
                                    <h5 className="text-own m-0">
                                        {trans[locate].the_product_is_not_for_sale}
                                    </h5>
                                    <span className="sub">
                                        <i>{trans[locate].the_owner_has_not_posted_this_product_for_sale}</i>
                                    </span>
                                </div>
                                <div className="mt-3 d-flex gap-3">
                                    <button onClick={() => setVisibleInfoOwnerModal(true)} className="btn btn-orange" style={{ width: 200 }} >
                                        {trans[locate].contact_the_owner}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* Negotiate list */}
            {infoSellCmd.is_open && !loadingInfo && (
                <>
                    <div className="mt-4" />
                    <NegotiateListCollection
                        collectionAddress={asset?.digitalInfo?.assetAddress}
                        nftId={nftIdSelected}
                        isOwnNFT={isOwnNFT}
                        onAccept={(index, infoCmd) => {
                            if (isAuthenticated()) {
                                setNegIndex(index)
                                setInfoNegCmd(infoCmd)
                                setVisibleAcceptNegModal(true)
                            }
                        }}
                        onRevoke={(infoCmd) => {
                            if (isAuthenticated()) {
                                setVisibleRevokeNegSubmit(true)
                                setInfoNegCmd(infoCmd)
                            }
                        }}
                        onChangeSubmittedNeg={(submitted)=>{
                            setSubmittedNeg(submitted)
                            setCheckingSubmittedNeg(false)
                        }}
                    />
                </>
            )}


            <style jsx global>
                {`
                    .ant-select:not(.ant-select-customize-input) .ant-select-selector{
                        border-color: #C4C4C4 !important;
                    }
                `}
            </style>
        </>
    )
}