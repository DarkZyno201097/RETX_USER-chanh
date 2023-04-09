import { Table, Tag, Space, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import { userApi } from '@apis/index';
import { authSelector } from '@store/auth/auth.slice';
import { locateSelector } from '@store/locate/locate.slice';
import { TransactionDTO } from 'src/models/smart_contract.model';
import { trans } from 'src/resources/trans';
import axios from 'axios';
import { contractSelector } from '@store/contract/contract.slice';
import { getTransactionsStableCoin } from '@utils/functions';
import { slugify } from '@utils/string';
import { getP2PTransaction } from '@utils/web3';
import { P2PTransaction } from 'src/models/user/p2p-transaction.model';
import { ColumnsType } from 'antd/lib/table';

class ColumnData extends P2PTransaction {
    index: number;

    constructor({
        trans,
        index,
    }: {
        trans: P2PTransaction,
        index: number
    }) {
        super(trans);
        this.index = index;
    }
}


export default function ProfileHistoryTransaction() {
    const dispatch = useDispatch()
    const { locate } = useSelector(locateSelector)
    const { user } = useSelector(authSelector)
    moment.locale(locate)
    const {
        infoContract,
        loadedInfoContracts,
        decimals,
        web3,
        web3Contract
    } = useSelector(contractSelector)

    const [textSearching, setTextSearching] = useState('')

    const [transactions, setTransactions] = useState<P2PTransaction[]>([])
    const [loadingTransaction, setLoadingTransaction] = useState(false)


    const columns: ColumnsType<ColumnData> = [
        {
            title: '#',
            dataIndex: 'index',
        },
        {
            title: trans[locate].sender,
            dataIndex: 'from',
            key: 'from',
            render: (value: string, record: ColumnData) => (
                <Tooltip placement="top" title={value}>
                    <p className="mb-0 text-truncate fs-6" style={{ maxWidth: 150 }} >
                        {value.slice(0, 4)}...{value.slice(-4)}
                    </p>
                </Tooltip>
            ),

        },
        {
            title: trans[locate].receiver,
            dataIndex: 'to',
            render: (value: string, record: ColumnData) => (
                <Tooltip placement="top" title={value}>
                    <p className="mb-0 text-truncate fs-6" style={{ maxWidth: 150 }} >
                        {value.slice(0, 4)}...{value.slice(-4)}
                    </p>
                </Tooltip>
            ),
        },
        {
            title: trans[locate].amount,
            dataIndex: 'amount',
            render: (text: string) => (
                <span>{parseInt(text).toLocaleString('vi-VN')}</span>
            )
        },
        {
            title: trans[locate].time,
            dataIndex: 'timestamp',
            render: (value: number, record: ColumnData) => (
                <span>
                    {moment(value * 1000).format('DD/MM/YYYY HH:mm:ss')}
                </span>
            )
        }

    ];

    useEffect(() => {
        (async () => {
            if (loadedInfoContracts && user.kycStatus == 'verified') {
                try {
                    setLoadingTransaction(true)
                    let transactions = await getP2PTransaction({
                        web3,
                        stableCoinContract: web3Contract.stableCoin,
                        abiStableCoin: infoContract.stableCoin.abi,
                        myWalletAddress: user.walletAddress,
                        addressStableCoin: infoContract.stableCoin.address
                    })
                    // console.log("🚀 ~ file: history_transactions.tsx:114 ~ transactions:", transactions)
                    setTransactions(transactions)
                }
                catch (e) {
                    console.log(e)
                }
                finally {
                    setLoadingTransaction(false)
                }
            }

        })()

    }, [loadedInfoContracts, user])


    return (
        <div>
            <div className="mb-3">
                <div className="profile-nav--search-bar">
                    <input onChange={(e) => {
                        var specials = /[^A-Za-z 0-9]/g;
                        if (specials.test(e.target.value)) return;
                        setTextSearching(e.target.value)
                    }}
                        pattern="[A-Za-z\W+]{1,25}" type="text" placeholder={trans[locate].search + "..."} />
                    <a role="button">
                        <i className="fa-regular fa-magnifying-glass"></i>
                    </a>
                </div>
            </div>
            <div style={{
                overflowX: 'auto'
            }}>
                <Table
                    style={{ minWidth: 700 }}
                    columns={columns as any}
                    dataSource={
                        transactions
                            .filter(item =>
                                slugify(item.from).includes(slugify(textSearching)) ||
                                slugify(item.to).includes(slugify(textSearching)) ||
                                slugify(item.amount.toString()).includes(slugify(textSearching))
                            )
                            // .sort((a, b) => -parseFloat(a.timestamp) + parseFloat(b.timestamp))
                            .map((trans, index) => new ColumnData({ trans, index: index + 1 }))
                    }
                    pagination={{ position: [window?.innerWidth <= 1200 ? 'bottomLeft' : 'bottomRight'] }}
                    // noDataContent="No Rows found"
                    locale={{ emptyText: trans[locate].no_data }}
                    loading={loadingTransaction}
                />
            </div>
        </div>
    )
}