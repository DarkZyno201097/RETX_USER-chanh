import { Table, Input, Button, Space, Tooltip, Progress, Pagination, Select } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ColumnsType } from "antd/lib/table";
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

import { locateSelector } from "@store/locate/locate.slice";
import { timeToHuman } from "@utils/functions";
import { AssetTransaction, TransactionDTO } from "src/models/smart_contract.model";
import { trans } from "src/resources/trans";
import ModalBase from ".";
import { TransactionContract } from "src/models/transaction.model";
import { convertNameMethod, getColorMethod, slugify } from "@utils/string";
import TabTransactionCollectionAsset from "@components/tab/transaction/collection_asset";
import moment from "moment";
import { authSelector } from "@store/auth/auth.slice";
import { TAssetType } from "src/models/asset/real_estate.model";
import TabTransactionSingleAsset from "@components/tab/transaction/single_asset";

const { Search } = Input;

interface IProps {
    transactions: AssetTransaction[];
    visible: boolean;
    onCancel: () => void;
    loading: boolean;
    assetType: TAssetType
}

export default function ModalTransactionAsset({ transactions, visible, onCancel, loading, assetType }: IProps) {

    const { locate } = useSelector(locateSelector)
    const [dataTable, setDataTable] = useState<AssetTransaction[]>([])
    const [textSearching, setTextSearching] = useState('')
    const [paginate, setPaginate] = useState({
        page: 1,
        limit: 5,
    })
    const { user } = useSelector(authSelector)

    useEffect(() => {
        setTextSearching('')
        setPaginate({
            ...paginate,
            page: 1,
        })

        setDataTable(transactions)
    }, [transactions])


    const onSearch = (value: any) => {
        setTextSearching(value)
        let trans = []
        trans = transactions.filter(item => {
            return item.from.includes(value) ||
                item.to.includes(value) ||
                item.nftId.toString().includes(value) ||
                (item.price + item.fee).toString().includes(value) ||
                moment(item.timestamp * 1000).format("DD/MM/YYYY HH:mm:ss").toString().includes(value)
        })
        setDataTable(trans)
    }



    return (
        <ModalBase visible={visible} onCancel={() => {
            onCancel()
        }}>
            <div className="w-100 bg-white p-5">
                <a onClick={() => {
                    onCancel()
                }} role="button" style={{
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
                <div className="w-100">
                    <div className="d-flex">
                        <Search placeholder={trans[locate].search} disabled={loading} allowClear value={loading ? '' : textSearching} onChange={e => onSearch(e.target.value)} onSearch={v => onSearch(v.trim())} style={{ width: '100%' }} />
                    </div>
                    <div className="d-flex justify-content-center flex-column" style={{
                        overflow: 'auto'
                    }}>

                        {assetType == 'collection_asset' && (
                            <TabTransactionCollectionAsset
                                transactions={loading ? [] : dataTable.filter(item => item.from.includes(user.walletAddress) || item.to.includes(user.walletAddress)).slice((paginate.page - 1) * paginate.limit, paginate.limit * paginate.page)}
                                loading={loading}
                                hiddenPaginate
                                hiddenFilterUser
                            />
                        )}

                        {assetType == 'single_asset' && (
                            <TabTransactionSingleAsset
                                transactions={loading ? [] : dataTable.filter(item => item.from.includes(user.walletAddress) || item.to.includes(user.walletAddress)).slice((paginate.page - 1) * paginate.limit, paginate.limit * paginate.page)}
                                loading={loading}
                                hiddenPaginate
                                hiddenFilterUser
                            />
                        )}


                    </div>

                    <div className="d-flex justify-content-end">
                        {dataTable.length > 0 && !loading && (
                            <Pagination
                                style={{
                                    marginTop: 10
                                }}
                                current={paginate.page}
                                onChange={(page) => {
                                    setPaginate({ ...paginate, page })
                                }}
                                total={dataTable.filter(item => item.from.includes(user.walletAddress) || item.to.includes(user.walletAddress)).length}
                                pageSize={paginate.limit}
                            />
                        )}
                    </div>
                </div>
            </div>
        </ModalBase>
    )
}