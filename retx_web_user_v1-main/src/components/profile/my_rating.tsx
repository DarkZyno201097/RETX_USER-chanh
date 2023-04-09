import { Table, Tag, Space } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { userApi } from '@apis/index';
import { assetSelector } from '@store/asset/asset.slice';
import { authSelector } from '@store/auth/auth.slice';
import { locateSelector } from '@store/locate/locate.slice';
import { routeNames } from '@utils/router';
import { slugify } from '@utils/string';
import { trans } from 'src/resources/trans';
import { RealEstateAssetView } from 'src/models/asset/real_estate.model';

class ColumnData implements RatingLinkAsset {
    _id: string;
    userId: string;
    assetId: string;
    content: string;
    ratting: string;
    createdAt: string;
    updatedAt: string;
    product: RealEstateAssetView
    locate: 'vi'|'en';

    constructor()
    constructor(obj?: ColumnData)
    constructor(obj?: any){
        this._id = obj?._id || '';
        this.userId = obj?.userId || '';
        this.assetId = obj?.assetId || '';
        this.content = obj?.content || '';
        this.createdAt = obj?.createdAt || '';
        this.updatedAt = obj?.updatedAt || '';
        this.product = obj?.product || new RealEstateAssetView();
        this.locate = obj?.locate || 'vi'
        this.ratting = obj?.ratting || ''
    }
}

interface RatingLinkAsset{
    _id: string;
    userId: string;
    assetId: string;
    content: string;
    ratting: string;
    createdAt: string;
    updatedAt?: string;
    product: RealEstateAssetView
}


export default function ProfileMyRatting() {
    const dispatch = useDispatch()
    const { locate } = useSelector(locateSelector)
    
    
    const [textSearching, setTextSearching] = useState('')
    const [dataTable, setDataTable] = useState<RatingLinkAsset[]>([])


    const columns = [
        {
            title: trans[locate].project,
            dataIndex: 'name',
            key: 'name',
            render: (text, record: ColumnData) => {
                return (
                    <a className="" href={routeNames.product + "/" + record.product._id}>{record.product.digitalInfo.assetName[record.locate]}</a>
                )
            },
        },
        {
            title: trans[locate].rating,
            dataIndex: 'ratting',
            key: 'ratting',
            
        },
        {
            title: trans[locate].content,
            dataIndex: 'content',
            key: 'content',
            width: 400,
            render: text => (
                <p>{text}</p>
            )
        },
        {
            title: '',
            key: 'action',
            render: (text, record: ColumnData) => (
                <div className="d-flex justify-content-center">
                    <button onClick={() => {
                        deleteRating(record._id)
                    }} className="button btn-cart-trash" style={{ lineHeight: 1, fontSize: 18 }}>
                        <i className="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            ),
        }
    ];

    useEffect(() => {
        (async () => {
            try{
                let res: any = await userApi.myRating()
                let list: RatingLinkAsset[] = res
                // console.log("🚀 ~ file: my_rating.tsx:107 ~ list", list)
                setDataTable(list.filter(item => !!item.product))               
            }
            catch(err){
                console.log(err);
            }
           
        })()
    }, [])

    const deleteRating = async (commentId: string) =>{
        try{
            let res = await userApi.deleteMyRating(commentId)
            let temp = [...dataTable]
            setDataTable(temp.filter(item => item._id != commentId))
        }
        catch(err){
            console.log(err);
        }
    }
   

    return (
        <div>
            <div className="mb-3">
                <div className="profile-nav--search-bar">
                    <input onChange={(e) => setTextSearching(e.target.value)} type="text" placeholder={trans[locate].search +"..."} />
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
                        dataSource={dataTable.filter(item => slugify(item.product.digitalInfo.assetName[locate]).indexOf(slugify(textSearching)) >= 0).map(item => new ColumnData({ ...item, locate } as any))}
                        pagination={{ position: [window?.innerWidth <= 1200 ? 'bottomLeft' : 'bottomRight'] }}
                        locale={{ emptyText: trans[locate].no_data }}
                    />
                </div>

        </div>
    )
}