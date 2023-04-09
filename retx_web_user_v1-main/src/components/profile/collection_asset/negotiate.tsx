import { assetApi } from "@apis/index";
import RevokeNegotiateNFTModal from "@components/collection/modal/revoke-neg";
import SuccessModal from "@components/collection/modal/success";
import NegotiateListCollection from "@components/collection/neg_list";
import ModalBase from "@components/modal";
import TableCollectionAsset from "@components/modal/asset_transactions";
import { alertActions } from "@store/actions";
import { authSelector } from "@store/auth/auth.slice";
import { contractSelector } from "@store/contract/contract.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { formatCurrency } from "@utils/number";
import { routeNames } from "@utils/router";
import { slugify } from "@utils/string";
import { getTransactionsCollectionAsset } from "@utils/web3";
import { Select, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { useMetaMask } from "metamask-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import { InfoCmd, InfoNftToken } from "src/models/nft.model";
import { AssetTransaction } from "src/models/smart_contract.model";
import { trans } from "src/resources/trans";
import { Contract } from "web3-eth-contract";

class ColumnData extends RealEstateAssetView {
    index: number;
    assetAddress: string;
    purchasedListNftId: number[]
    negotiateListNftId: number[]
    contractCollection: Contract
    constructor({
        product,
        index,
        purchasedListNftId,
        negotiateListNftId,
        contractCollection
    }: {
        product: RealEstateAssetView,
        index: number,
        purchasedListNftId: number[],
        negotiateListNftId: number[],
        contractCollection: Contract
    }) {
        super(product);
        this.index = index
        this.assetAddress = product.digitalInfo.assetAddress
        this.purchasedListNftId = purchasedListNftId
        this.negotiateListNftId = negotiateListNftId
        this.contractCollection= contractCollection
    }
}

interface IProps {
    loadingTable: boolean
    dataTable: ColumnData[]
}

export default function ProfileCollectionAssetNegotiate({
    loadingTable,
    dataTable
}: IProps) {
    const dispatch = useDispatch()
    const {
        infoContract,
        loadedInfoContracts,
        web3,
        web3Contract
    } = useSelector(contractSelector)
    const { user, authenticated } = useSelector(authSelector)
    const { locate, locations } = useSelector(locateSelector)
    const [data, setData] = useState<ColumnData[]>([])
    const [paginate, setPaginate] = useState({
        page: 1,
        limit: 10,
    })
    const { account, status } = useMetaMask()
    const [textSearching, setTextSearching] = useState('')
    const [assetSelected, setAssetSelected] = useState<ColumnData>(null)
    const [visibleNegModal, setVisibleNegModal] = useState(false)
    const [nftIdSelected, setNftIdSelected] = useState(null)
    const [visibleRevokeNegSubmit, setVisibleRevokeNegSubmit] = useState(false)
    const [infoNegCmd, setInfoNegCmd] = useState<InfoCmd>(new InfoCmd())
    const [visibleSuccessModal, setVisibleSuccessModal] = useState(false)
    const [transactionHash, setTransactionHash] = useState('')
    const [loadingInfo, setLoadingInfo] = useState(false)
    const [info, setInfo] = useState({
        name: "",
        symbol: "",
        image: "",
        description: ""
    })
    const [contractCollection, setContractCollection] = useState(null)

    const columns: ColumnsType<ColumnData> = [

        {
            title: trans[locate].name,
            dataIndex: 'name',
            render: (text, record: ColumnData) => <Link href={routeNames.product + "/" + record._id} >{record.digitalInfo.assetName[locate]}</Link>,
        },
        {
            title: trans[locate].amount_of_assets,
            dataIndex: 'negotiateListNftId',
            render: (value: number[]) => (
                <span>{value.length.toLocaleString('vi-VN')}</span>
            ),
            defaultSortOrder: 'descend',
            sorter: (a: ColumnData, b: ColumnData) => - a.negotiateListNftId.length + b.negotiateListNftId.length,

        },
        {
            title: "Asset ID",
            dataIndex: 'negotiateListNftId',
            render: (negotiateListNftId: number[]) => (
                <>
                    {negotiateListNftId ? negotiateListNftId.join(", ") : 'N/A'}
                </>
            ),

        },
        {
            title: '',
            dataIndex: '',
            render: (value, record: ColumnData) => {
                return (
                    <div className="d-flex justify-content-center">
                        <button onClick={async () => {
                            setAssetSelected(record)
                            setVisibleNegModal(true)
                            setNftIdSelected(record?.negotiateListNftId[0])
                            setContractCollection(record.contractCollection)
                        }} className='btn btn-outline-secondary'>
                            {trans[locate].see_price_negotiable}
                        </button>
                    </div>
                )
            }
        }
    ];

    useEffect(()=>{
        setData(dataTable)
    },[dataTable])

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
        else if (user.kycStatus == 'pending'&& !!user.hasUploadedKyc) {
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

    const getInfoNftId = async (id: number) => {
        try {
            setLoadingInfo(true)
            let nftUri = await contractCollection?.methods.tokenURI(id).call()
            let { data } = await assetApi.pinataURI(nftUri.split('://')[1])
            let infoNft = new InfoNftToken(data)

            setInfo({
                name: infoNft.name,
                // symbol: asset.digitalInfo.assetSymbol['vi'],
                symbol: "",
                image: `https://${process.env.GATEWAY_PINATA}/ipfs/${infoNft.image.split('://')[1]}`,
                description: infoNft.description
            })
        }
        catch (error) {
            console.log("🚀 ~ file: box_trade.tsx:85 ~ getInfoNftId ~ error:", error)
            setInfo({
                name: 'N/A',
                symbol: '',
                image: `#`,
                description: "N/A"
            })
        }
        finally {
            setLoadingInfo(false)
        }
    }


    return (
        <>
            <div className="mb-3">
                <div className="profile-nav--search-bar">
                    <input onChange={e => setTextSearching(e.target.value)} value={textSearching} type="text" placeholder={trans[locate].search + "..."} />
                    <a role="button">
                        <i className="fa-regular fa-magnifying-glass"></i>
                    </a>
                </div>
            </div>
            <div style={{
                overflowX: 'auto'
            }}>
                <Table
                    bordered
                    locale={{ emptyText: trans[locate].no_data }}
                    loading={loadingTable}
                    style={{ minWidth: 700 }}
                    columns={columns as any}
                    dataSource={data.filter(item =>
                        slugify(item.digitalInfo.assetName[locate]).includes(slugify(textSearching))
                    )}
                    pagination={{ position: [window?.innerWidth <= 1200 ? 'bottomLeft' : 'bottomRight'] }}
                />
            </div>

            {/* Thông báo thành công */}
            <SuccessModal
                onCancel={() => {
                    setVisibleSuccessModal(false)
                    setTransactionHash("")
                }}
                visible={visibleSuccessModal}
                transactionHash={transactionHash}
            />

            {/* Huỷ trả giá */}
            <RevokeNegotiateNFTModal
                visible={visibleRevokeNegSubmit}
                onCancel={() => {
                    setVisibleRevokeNegSubmit(false)
                }}
                assetName={assetSelected?.digitalInfo.assetName['vi']}
                assetAddress={assetSelected?.digitalInfo.assetAddress}
                assetLocation={locations.getFull(
                    assetSelected?.additionalInfo.location.cityCode,
                    assetSelected?.additionalInfo.location.districtCode,
                    assetSelected?.additionalInfo.location.wardCode,
                )}
                assetImage={info.image}
                numberNFT={nftIdSelected}
                infoNegCmd={infoNegCmd}
                onSuccess={({ transactionHash }) => {
                    setVisibleRevokeNegSubmit(false);
                    // getInfoNftId(nftIdSelected)
                    setTransactionHash(transactionHash)
                    setVisibleSuccessModal(true)

                    assetSelected.negotiateListNftId = assetSelected?.negotiateListNftId.filter(item => item != nftIdSelected)
                    setData([...data].map(item =>{
                        if (item._id == assetSelected._id) return assetSelected
                        else return item
                    }).filter(item => item.negotiateListNftId.length > 0))
                    if (assetSelected.negotiateListNftId.length == 0) {
                        setVisibleNegModal(false)
                    }
                    else {
                        setNftIdSelected(assetSelected.negotiateListNftId[0])
                    }
                }}
            />

            <ModalBase visible={visibleNegModal} onCancel={() => {
                setVisibleNegModal(false)
            }}>
                <div className="w-100 bg-white collection-box-trade">
                    <div className="head" style={{ borderBottom: 0 }}>
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
                                placeholder="Chọn"
                                optionFilterProp="children"
                                filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                options={assetSelected?.negotiateListNftId?.map(item => {
                                    return {
                                        value: item,
                                        label: item.toString()
                                    }
                                })}
                                value={nftIdSelected}
                                onChange={(value) => {
                                    setNftIdSelected(value)
                                    // getInfoNftId(value)
                                    // onChangeNftIdSelected(value)
                                }}
                            // loading={loadingInfo}
                            />

                        </div>
                    </div>
                    <NegotiateListCollection
                        collectionAddress={assetSelected?.digitalInfo?.assetAddress}
                        nftId={nftIdSelected}
                        isOwnNFT={false}
                        onAccept={(index, infoCmd) => {
                            // if (isAuthenticated()) {
                            //     setNegIndex(index)
                            //     setInfoNegCmd(infoCmd)
                            //     setVisibleAcceptNegModal(true)
                            // }
                        }}
                        onRevoke={async (infoCmd, nftId) => {
                            if (isAuthenticated()) {
                                setVisibleRevokeNegSubmit(true)
                                setInfoNegCmd(infoCmd)
                                await getInfoNftId(nftId)
                            }
                        }}
                        onChangeSubmittedNeg={(submitted) => {
                            console.log("🚀 ~ file: negotiate.tsx:173 ~ submitted:", submitted)

                        }}
                        onlyMe
                    />
                </div>
            </ModalBase>
        </>
    )
}