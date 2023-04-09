import { authSelector } from "@store/auth/auth.slice"
import { locateSelector } from "@store/locate/locate.slice"
import { getTableLocateText } from "@utils/string"
import { Select, Tooltip } from "antd"
import Table, { ColumnsType } from "antd/lib/table"
import _ from "lodash"
import moment from "moment"
import { useState } from "react"
import { useSelector } from "react-redux"
import { AssetTransaction } from "src/models/smart_contract.model"
import { trans } from "src/resources/trans"


interface DataType extends AssetTransaction {
    index: number
}

interface IProps {
    transactions: AssetTransaction[],
    loading: boolean,
    hiddenPaginate?: boolean,
    hiddenFilterUser?: boolean
}

export default function TabTransactionCollectionAsset({
    transactions,
    loading,
    hiddenPaginate,
    hiddenFilterUser
}: IProps) {
    const { locate } = useSelector(locateSelector)
    const { user } = useSelector(authSelector)
    const [filterUser, setFilterUser] = useState('')


    const columns: ColumnsType<DataType> = [
        {
            title: 'Time',
            dataIndex: 'timestamp',
            render: (value: string) => (
                <span style={{ fontWeight: 400 }}>{moment(parseInt(value) * 1000).format("DD/MM/YYYY HH:mm:ss")}</span>
            ),
            sorter: (a, b) => -a.timestamp + b.timestamp,
            defaultSortOrder: 'ascend',
            showSorterTooltip: false,
        },
        {
            title: 'From',
            dataIndex: 'from',
            render: (value: string) => (
                <Tooltip placement="top" title={value}>
                    <span style={{ fontWeight: 400 }}>{value.slice(0, 4)}...{value.slice(-4)}</span>
                </Tooltip>
            )
        },
        {
            title: 'To',
            dataIndex: 'to',
            render: (value: string) => (
                <Tooltip placement="top" title={value}>
                    <span style={{ fontWeight: 400 }}>{value.slice(0, 4)}...{value.slice(-4)}</span>
                </Tooltip>
            )
        },
        {
            title: 'Asset ID',
            dataIndex: 'nftId',
            sorter: (a, b) => -a.nftId + b.nftId,
            showSorterTooltip: false,
            filters: _.uniqBy(transactions, 'nftId').sort((a, b) => a.nftId - b.nftId).map(item => {
                return {
                    text: item.nftId,
                    value: item.nftId,
                }
            }),
            filterSearch: true,
            onFilter: (value: number, record) => record.nftId == value,
        },
        {
            title: 'Price (VND)',
            dataIndex: '',
            render: (value: string, record: DataType) => (
                <span style={{ fontWeight: 400 }}>{(record.price + record.fee).toLocaleString('vi-VN')}</span>
            ),
            showSorterTooltip: false,
            sorter: (a, b) => -a.price + b.price,
        },
        {
            title: trans[locate].status,
            dataIndex: 'status',
            render: (value: boolean) => (
                <span style={{ fontWeight: 400 }}>
                    {value ? 
                    (<Tooltip title={trans[locate].success}><i className="fa-regular fa-circle-check text-success"></i></Tooltip> ) : 
                    (<Tooltip title={trans[locate].failed}><i className="fa-regular fa-circle-xmark text-danger"></i></Tooltip>)}
                </span>
            ),
        },
    ]

    return (
        <>
            {!hiddenFilterUser && (
                <div className="d-flex justify-content-end mb-1">
                <Select
                    style={{ width: 120 }}
                    onChange={setFilterUser}
                    value={filterUser}
                    options={[
                        {
                            value: user.walletAddress,
                            label: trans[locate].mine,
                        },
                        {
                            value: '',
                            label: trans[locate].all,
                        },
                    ]}
                    disabled={loading}
                />
            </div>
            )}
            <Table
                bordered
                locale={getTableLocateText(locate)}
                loading={loading}
                columns={columns}
                dataSource={[...transactions].filter(item =>item.from.includes(filterUser) || item.to.includes(filterUser))}
                scroll={{ x: 700 }}
                pagination={hiddenPaginate ? false : { pageSize: 5 }}

            />
        </>
    )
}