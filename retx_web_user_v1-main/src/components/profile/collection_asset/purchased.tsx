import { assetApi } from "@apis/index";
import ModalTransactionAsset from "@components/modal/asset_transactions";
import { authSelector } from "@store/auth/auth.slice";
import { contractSelector } from "@store/contract/contract.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { formatCurrency } from "@utils/number";
import { routeNames } from "@utils/router";
import { slugify } from "@utils/string";
import { getTransactionsCollectionAsset } from "@utils/web3";
import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import { AssetTransaction } from "src/models/smart_contract.model";
import { trans } from "src/resources/trans";

class ColumnData extends RealEstateAssetView {
    index: number;
    assetAddress: string;
    purchasedListNftId: number[]
    negotiateListNftId: number[]
    constructor({
        product,
        index,
        purchasedListNftId,
        negotiateListNftId
    }: {
        product: RealEstateAssetView,
        index: number,
        purchasedListNftId: number[],
        negotiateListNftId: number[]
    }) {
        super(product);
        this.index = index
        this.assetAddress = product.digitalInfo.assetAddress
        this.purchasedListNftId = purchasedListNftId
        this.negotiateListNftId = negotiateListNftId
    }
}

interface IProps{
    loadingTable: boolean
    dataTable: ColumnData[]
}

export default function ProfileCollectionAssetPurchased({
    loadingTable,
    dataTable
}:IProps) {
    const {
        infoContract,
        loadedInfoContracts,
        web3,
        web3Contract
    } = useSelector(contractSelector)
    const { user } = useSelector(authSelector)
    const { locate } = useSelector(locateSelector)
    const [paginate, setPaginate] = useState({
        page: 1,
        limit: 10,
    })

    const [textSearching, setTextSearching] = useState('')

    const columns: ColumnsType<ColumnData> = [

        {
            title: trans[locate].name,
            dataIndex: 'name',
            render: (text, record: ColumnData) => <Link href={routeNames.product + "/" + record._id} >{record.digitalInfo.assetName[locate]}</Link>,
        },
        {
            title: trans[locate].amount_of_assets,
            dataIndex: 'purchasedListNftId',
            render: (value: number[]) => (
                <span>{value.length.toLocaleString('vi-VN')}</span>
            ),
            defaultSortOrder: 'descend',
            sorter: (a: ColumnData, b: ColumnData) => - a.purchasedListNftId.length + b.purchasedListNftId.length,

        },
        {
            title: "Asset ID",
            dataIndex: 'purchasedListNftId',
            render: (purchasedListNftId: number[]) => (
                <>
                    {purchasedListNftId ? purchasedListNftId.join(", ") : 'N/A'}
                </>
            ),

        },
        {
            title: '',
            dataIndex: '',
            render: (value, record: ColumnData) => {
                return (
                    <div className="d-flex justify-content-center">
                        <button onClick={() => getTransactions(new RealEstateAssetView(record))} className='btn btn-outline-secondary'>
                            {trans[locate].view_transactions}
                        </button>
                    </div>
                )
            }
        }
    ];

    const [visibleTableTransactions, setVisibleTableTransactions] = useState(false)
    const [transactions, setTransactions] = useState<AssetTransaction[]>([])
    const [loadingTransactions, setLoadingTransactions] = useState(false)
    const [assetAddressSelected, setAssetAddressSelected] = useState('')


    const getTransactions = async (asset: RealEstateAssetView) => {
        try {
            setAssetAddressSelected(asset.digitalInfo.assetAddress)
            setVisibleTableTransactions(true)
            setLoadingTransactions(true)

            let transactions = await getTransactionsCollectionAsset({
                web3,
                assetAddress: asset.digitalInfo?.assetAddress,
                abiCollection: infoContract.collection.abi,
                abiNftExchange: infoContract.nftExchange.abi,
                assetContract: new web3.eth.Contract(JSON.parse(infoContract.collection.abi), asset.digitalInfo.assetAddress),
            })
            setTransactions([...transactions])
        }
        catch (err) {
            console.log("🚀 ~ file: collection_asset.tsx:185 ~ getTransactions ~ err:", err)

        }
        finally {
            setLoadingTransactions(false)
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
                    dataSource={dataTable.filter(item => slugify(item.digitalInfo.assetName[locate]).indexOf(slugify(textSearching)) >= 0)}
                    pagination={{ position: [window?.innerWidth <= 1200 ? 'bottomLeft' : 'bottomRight'] }}
                />
            </div>
            <ModalTransactionAsset
                visible={visibleTableTransactions}
                onCancel={() => setVisibleTableTransactions(false)}
                transactions={transactions}
                loading={loadingTransactions}
                assetType='collection_asset'
            />
        </>
    )
}