import { authSelector } from "@store/auth/auth.slice";
import { contractSelector } from "@store/contract/contract.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { getListNegotiated } from "@utils/web3";
import { Select, Tag } from "antd";
import Table, { ColumnsType } from "antd/lib/table";
import { filter } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { InfoCmd } from "src/models/nft.model";
import { trans } from "src/resources/trans";
import { Contract } from "web3-eth-contract";

class DataType extends InfoCmd {
    index: number;
    key: string;
    constructor(obj?: {
        index: number;
        key: string;
        data: InfoCmd
    }) {
        super(obj.data)
        this.index = obj?.index || 0;
        this.key = obj?.key || "";
    }
}

interface IProps {
    collectionAddress: string,
    nftId: number,
    isOwnNFT: boolean,
    onAccept: (index: number, infoCmd: InfoCmd) => void,
    onRevoke: (infoCmd: InfoCmd, index?: number) => void,
    onChangeSubmittedNeg: (submitted: InfoCmd) => void,
    onlyMe?: boolean,
}

export default function NegotiateListCollection({
    collectionAddress,
    nftId,
    isOwnNFT,
    onAccept,
    onRevoke,
    onChangeSubmittedNeg,
    onlyMe
}: IProps) {
    const {
        web3Contract
    } = useSelector(contractSelector)
    const {user, authenticated} = useSelector(authSelector)
    const { locate } = useSelector(locateSelector)
    const [negList, setNegList] = useState<InfoCmd[]>([])
    const [loading, setLoading] = useState(false)
    const [filterUser, setFilterUser] = useState('')

    const columns: ColumnsType<DataType> = [
        {
            title: trans[locate].numerical_order,
            dataIndex: 'index',
            render: (index: number, record: DataType)=>(
                <span>
                    #{index} {record.maker.toLowerCase() == user.walletAddress && (<i className="fa-solid fa-user"></i>)}
                </span>
            ),
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: trans[locate].negotiating_party,
            dataIndex: 'maker',
            render: (text: string) => <a>{text?.slice(0, 4)}...{text?.slice(-4)}</a>,
        },
        {
            title: trans[locate].desired_price,
            dataIndex: 'price',
            render: (price: number) => <span style={{ color: '#38C976', fontWeight: 600 }}>{price.toLocaleString('vi-VN')}</span>,
            sorter: (a, b) => a.price - b.price,
            defaultSortOrder: 'descend'
        },
        {
            title: trans[locate].status,
            dataIndex: 'is_open',
            render: (isOpen: boolean) => (
                <>
                    {isOpen ? (
                        <span className="neg-list--tag-pending">
                            {trans[locate].pending}
                        </span>
                    ) : (
                        <span className="neg-list--tag-cancel">
                            {trans[locate].cancelled}
                        </span>
                    )}
                </>
            )
        },
        {
            title: trans[locate].action,
            dataIndex: 'is_open',
            render: (isOpen: boolean, record: DataType) => {
                return (<div className="d-flex gap-2 flex-column">
                    {isOpen && isOwnNFT && (
                        <button onClick={() => {
                            onAccept(record.index, new InfoCmd(record))
                        }} className="btn btn-orange" style={{ width: 90 }} >
                            {trans[locate].agree}
                        </button>
                    )}
                    {isOpen && record.maker.toLowerCase() == user.walletAddress && (
                        <button onClick={()=>{
                            onRevoke(new InfoCmd(record), record.index)
                        }} className="btn btn-orange" style={{ width: 90 }} >
                            {trans[locate].cancel}
                        </button>
                    )}
                </div>)
            }
        }
    ];

    useEffect(() => {
        // init load
        (async () => {
            if (nftId > 0 && web3Contract.nftExchange) {
                try {
                    setNegList([])
                    setLoading(true)
                    let list =  await getListNegotiated({
                        nftExchange: web3Contract.nftExchange,
                        collectionAddress,
                        nftId
                    })
                    setNegList(list)
                    onChangeSubmittedNeg(list.find(item => {
                        let data = new InfoCmd(item)
                        if (data.maker == user.walletAddress && data.is_open) return true
                        else return false
                    }) || null)
                }
                catch (err) {
                    console.log(err);
                }
                finally{
                    setLoading(false)
                }
            }
        })()
    }, [nftId, web3Contract])


    return (
      <>
        <div className="neg-list--header">
          <h6 className="name">
            {trans[locate].negotiable_List}
          </h6>
          {authenticated && !onlyMe && (
            <div className="">
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
                    value: "",
                    label: trans[locate].all,
                  },
                ]}
              />
            </div>
          )}
        </div>
        <Table
          locale={{
            triggerDesc: "",
            triggerAsc: "",
            cancelSort: "",
          }}
          bordered
          columns={columns}
          dataSource={negList
            .filter((item) => item.maker.toLowerCase().includes(onlyMe ? user.walletAddress : filterUser))
            .map(
              (item, index) =>
                new DataType({
                  index: index + 1,
                  key: index.toString(),
                  data: item,
                })
            )}
          style={{
            border: "1px solid #c4c4c4",
          }}
          loading={loading}
          // pagination={false}
        />
      </>
    );
}