import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { getTableLocateText } from "@utils/string";
import { Select, Tooltip } from "antd";
import Table, { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { useState } from "react";
import { useSelector } from "react-redux";
import { AssetTransaction } from "src/models/smart_contract.model";
import { trans } from "src/resources/trans";



interface DataType extends AssetTransaction {
    index: number
}

interface IProps {
    transactions: AssetTransaction[],
    loading: boolean,
    hiddenPaginate?: boolean,
    hiddenFilterUser?: boolean
}

export default function TabTransactionRisingPoolAsset(props: IProps) {

    const { locate } = useSelector(locateSelector)
    const { user } = useSelector(authSelector)
    const [filterUser, setFilterUser] = useState('')


    const columns: ColumnsType<DataType> = [
        {
            title: 'Time',
            dataIndex: 'timestamp',
            render: (value: string) => (
                <span style={{ fontWeight: 400 }}>{moment(parseInt(value) * 1000).format("DD/MM/YYYY HH:mm:ss")}</span>
            )
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
            title: 'Type',
            dataIndex: 'method',
            render: (value) => (
                <span style={{ fontWeight: 400 }}>
                    <span style={{ color: value == 'invest' ? "#3fdd3a" : value == 'transfer' ? '#212529' : '#e33737', width: 70, textAlign: 'left', display:'block' }}>
                        {value == 'invest' ? trans[locate].investment : value == 'transfer' ? 'P2P' : trans[locate].withdraw}
                    </span>
                </span>
            )
        },
        {
            title: `Amount (${trans[locate].certificate})`,
            dataIndex: 'amount',
            render: (value: string) => (
                <span style={{ fontWeight: 400 }}>{parseInt(value).toLocaleString('vi-VN')}</span>
            ),

        },
        {
            title: 'Price (VND)',
            dataIndex: 'price',
            render: (value: string) => (
                <span style={{ fontWeight: 400 }}>{parseInt(value).toLocaleString('vi-VN')}</span>
            )
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
            {!props.hiddenFilterUser && (
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
                        disabled={props.loading}
                    />
                </div>
            )}
            <Table locale={getTableLocateText(locate)}
                columns={columns}
                dataSource={[...props.transactions].filter(item =>item.from.includes(filterUser) || item.to.includes(filterUser))}
                scroll={{ x: 700 }}
                loading={props.loading}
                pagination={props.hiddenFilterUser ? false : { pageSize: 5 }}
            />
        </>
    )
}