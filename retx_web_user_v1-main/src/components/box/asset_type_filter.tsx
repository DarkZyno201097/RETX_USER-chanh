import { useSelector } from "react-redux"
import { Button, Checkbox, Col, Row, Select } from "antd"

import { locateSelector } from "@store/locate/locate.slice"
import { IFilterAssetOption } from "src/models/asset/filter_options"
import { trans } from "src/resources/trans"
import { useState } from "react"
import { slugify } from "@utils/string"
import { TAssetType } from "src/models/asset/real_estate.model"


interface IRealEstateInfo {
    id: string;
    translates: {
        [key: string]: any
    }
}

interface IProps {
    filterOptions: IFilterAssetOption,
    value: string,
    onChange: (values: TAssetType | null) => void

}

export default function AssetTypeFilter({ filterOptions, value, onChange}: IProps) {

    const { locate, locations } = useSelector(locateSelector)

    const clearAll = () => {
        onChange(null)
    }

    return (
        <div className="product-list--box__right">
            <div className="type_of_asset col-12  p-0">
                <div className="title_type p-2 d-flex justify-content-between">
                    <span style={{ color: '#505050', fontWeight: 600 }}>{trans[locate].certificate_type}</span>
                    {filterOptions.directions.length > 0 && (
                        <Button size='small' onClick={clearAll}>
                            {trans[locate].unchecked}
                        </Button>
                    )}
                </div>
            </div>
            <div className="item_type_of_asset col-12 px-2 pb-2 ">

                <div className="mb-2">
                    <Select
                        showArrow
                        value={value}
                        onChange={onChange}
                        style={{ width: '100%' }}
                        options={[
                            {
                                label: trans[locate].certificate_of_ownership,
                                value: 'collection_asset'
                            },
                            {
                                label: trans[locate].certificate_of_investment,
                                value: 'single_asset'
                            },
                            {
                                label: trans[locate].all,
                                value: null
                            }
                        ]}
                        optionFilterProp="children"
                        filterOption={(input, option) => slugify((option?.label ?? '')).includes(slugify(input))}
                        filterSort={(optionA, optionB) =>
                            slugify((optionA?.label ?? '')).toLowerCase().localeCompare(slugify((optionB?.label ?? '')).toLowerCase())
                        }
                    />
                </div>
            </div>
        </div>
    )
}