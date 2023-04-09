import { Checkbox, Col, Row } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";

import { locateSelector } from "@store/locate/locate.slice";
import { slugify } from "@utils/string";
import { IFilterAssetOption } from "src/models/asset/filter_options";
import { trans } from "src/resources/trans"


interface ISeller{
    id: string,
    name: string
}


interface IProps{
    filterSeller: (value: string[]) => void,
    sellers: ISeller[],
    filterOptions: IFilterAssetOption
}

export default function SellerFilter({filterSeller, sellers, filterOptions}: IProps){

    const {locate} = useSelector(locateSelector)
    const [searchText, setSearchText] = useState('');

    return(
        <div className="w-100 p-3">
            <li>
                <div className="search_dropdown">
                    <input onChange={(e) => setSearchText(e.target.value)} className="search_item w-100" style={{padding: 5, border: '1px solid #bababa', outline: 0}} type="text" placeholder={trans[locate].search} />
                </div>
            </li>
            <Checkbox.Group style={{width: '100%'}} value={filterOptions.sellers} onChange={(value: string[]) => {
                filterSeller(value)
            }} >
                <Row>
                    {[...new Map(sellers.map(item =>[item['id'], item])).values()].filter(item => !!item.id && slugify(item.name).indexOf(slugify(searchText)) >= 0).map((item, index) => (
                        <Col key={index} span="24">
                            <Checkbox
                                value={item.id}
                                style={{
                                    marginTop: 10,
                                    width: '100%'
                                }}
                            >{item.name}</Checkbox>
                        </Col>
                    ))}
                </Row>
            </Checkbox.Group>

        </div>
    )
}