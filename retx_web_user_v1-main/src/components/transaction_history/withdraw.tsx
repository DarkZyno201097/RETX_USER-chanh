import { Table, Tag } from "antd";
import moment from "moment";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { transactionActions } from "@store/actions";
import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { transactionSelector } from "@store/transaction/transaction.slice";
import { formatCurrency } from "@utils/number";
import { TransactionWithdraw, TTransactionWithdrawStatus } from "src/models/transaction.model";
import { trans } from "src/resources/trans";


class ColumnData extends TransactionWithdraw {
    index: number;
    receiveBankName: string;
    receiveBankAccountHolder: string;
    receiveBankAccountNumber: string;
    constructor({ transaction, index }: {
        transaction: TransactionWithdraw,
        index: number
    }) {
        super(transaction)
        this.index = index + 1
        this.receiveBankName = transaction.receiveBankName + ` (${transaction.receiveBankShortName})`
        this.receiveBankAccountHolder = transaction.receiveBankAccountHolder
        this.receiveBankAccountNumber = transaction.receiveBankAccountNumber
    }
}

export default function TransactionWithdrawHistory() {

    const dispatch = useDispatch()
    const { locate } = useSelector(locateSelector)
    const { user } = useSelector(authSelector)
    const {
        withdrawTransactions,
        loadingWithdrawTransactions
    } = useSelector(transactionSelector)

    useEffect(() => {
        dispatch(transactionActions.getWithdrawTransactions(user?.id, {
            page: 1,
            limit: 10
        }))
    }, [])

    const columns = [

        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
        },
        {
            title: trans[locate].time,
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (text: string) => (
                <span>
                    {moment(text).format('DD/MM/YYYY HH:mm:ss')}
                </span>
            )
        },
        {
            title: trans[locate].amount,
            dataIndex: 'amount',
            key: 'amount',
            render: (text: number) => (
                <span>{formatCurrency(text.toString())}</span>
            )
        },
        {
            title: trans[locate].receive_bank,
            dataIndex: 'receiveBankName',
            key: 'receiveBankName',
        },
        {
            title: trans[locate].receive_account_number,
            dataIndex: 'receiveBankAccountNumber',
            key: 'receiveBankAccountNumber',
        },
        {
            title: trans[locate].receive_account_number,
            dataIndex: 'receiveBankAccountHolder',
            key: 'receiveBankAccountHolder'
        },
        {
            title: trans[locate].status,
            dataIndex: 'status',
            key: 'status',
            render: (text: TTransactionWithdrawStatus) => {
                return (
                    <>
                        <Tag color={text == 'done' ? 'green' : text == 'pending' || text == 'half-done' ? 'orange' : 'red'}>{trans[locate][text]}</Tag>
                    </>
                )
            }
        },
        {
            title: trans[locate].feadback,
            dataIndex: 'feedback',
            key: 'feedback'
        }

    ];

    return (
        <div
            className="w-100"
            style={{
                overflow: 'auto'
            }}
        >
            <Table
                locale={{ emptyText: trans[locate].no_data }}
                loading={loadingWithdrawTransactions}
                style={{ minWidth: 700 }}
                columns={columns as any}
                dataSource={withdrawTransactions.data.map((item, index) => new ColumnData({
                    transaction: item,
                    index
                }))}
                pagination={{
                    position: [window?.innerWidth <= 1200 ? 'bottomLeft' : 'bottomRight'],
                    current: withdrawTransactions.page,
                    total: withdrawTransactions.totalPage * 10,
                    pageSize: 10,
                    onChange: (page, pageSize) => {
                        dispatch(transactionActions.getWithdrawTransactions(user?.id, {
                            page,
                            limit: pageSize
                        }))
                    }
                }}
            />
        </div>
    )
}