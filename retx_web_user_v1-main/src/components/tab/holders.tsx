import { locateSelector } from "@store/locate/locate.slice";
import { getTableLocateText } from "@utils/string";
import { Tooltip } from "antd";
import Table, { ColumnsType } from "antd/lib/table";
import { useSelector } from "react-redux";
import { trans } from "src/resources/trans";

interface IHolders {
    address: string;
    amount: number;
    percentage: number;
}

interface DataType extends IHolders {
    index: number
}

interface IProps {
    data: IHolders[],
    loading: boolean
}

export default function TabListHolders(props: IProps) {

    const { locate } = useSelector(locateSelector)


    const columns: ColumnsType<DataType> = [
        {
            title: trans[locate].investors,
            dataIndex: 'address',
            render: (value: string) => (
                <Tooltip placement="top" title={value}>
                    <span style={{ fontWeight: 400 }}>{value.slice(0, 4)}...{value.slice(-4)}</span>
                </Tooltip>
            )
        },
        {
            title: `Amount (${trans[locate].certificate})`,
            dataIndex: 'amount',
            render: (value: number) => (
                <span style={{ fontWeight: 400 }}>{value.toLocaleString('vi-VN')}</span>
            ),
            defaultSortOrder: "descend",
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: trans[locate].percentage,
            dataIndex: 'percentage',
            render: (value: number) => (
                <span style={{ fontWeight: 400 }}>{(value).toLocaleString('vi-VN', { maximumFractionDigits: 4 })}%</span>
            ),
            sorter: (a, b) => -a.percentage + b.percentage,
        },
    ]

    return (
        <>
            <Table
                bordered
                locale={getTableLocateText(locate)}
                columns={columns}
                loading={props.loading}
                dataSource={props.data}
                scroll={{ x: 700 }}
            />
        </>
    )
}