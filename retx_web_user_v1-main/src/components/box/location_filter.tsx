import { useSelector } from "react-redux";

import { locateSelector } from "@store/locate/locate.slice";
import { IFilterAssetOption } from "src/models/asset/filter_options";
import { trans } from "src/resources/trans";
import { Button, Select } from "antd";
import { slugify } from "@utils/string";
import { useState } from "react";


interface IProps {
    filterOptions: IFilterAssetOption,
    values: {
        cityCode: string,
        districtCode: string,
        wardCode: string
    },
    onChange: (values: {
        cityCode: string,
        districtCode: string,
        wardCode: string
    }) => void
}


export default function LocationFilter({
    filterOptions,
    values,
    onChange
}: IProps) {
    const { locate, locations } = useSelector(locateSelector)
    // const [locationData, setLocationData] = useState({
    //     cityCode: null,
    //     districtCode: null,
    //     wardCode: null
    // })

    const onChangeData = (fieldname: 'cityCode' | 'districtCode' | 'wardCode') => (value: string) => {
        let temp = {...values}
        temp[fieldname] = value
        if (fieldname == 'cityCode'){
            temp.districtCode = null
            temp.wardCode = null
        }
        else if (fieldname == 'districtCode'){
            temp.wardCode = null
        }
        onChange(temp)
    }


    const clearAll = () => {
        onChange({
            cityCode: null,
            districtCode: null,
            wardCode: null
        })
    }


    return (
        <>
            <div className="product-list--box__right">
                <div className="type_of_asset  p-0 ">
                    <div className="title_type p-2 d-flex justify-content-between">
                        <span style={{ color: '#505050', fontWeight: 600}}>{trans[locate].add_location}</span>
                        {values.cityCode && (
                            <Button size='small' onClick={clearAll}>
                                {trans[locate].unchecked}
                            </Button>
                        )}
                    </div>
                </div>
                <div className="item_type_of_asset px-2  ">
                    {/* <div className="title_item_type">
                        <p className="pb-0 mb-1">{trans[locate].province}</p>
                    </div> */}
                    <div className="input-group mb-3">
                        <Select
                            placeholder={trans[locate].choose_city}
                            showSearch
                            value={values.cityCode || null}
                            style={{ width: '100%' }}
                            onChange={onChangeData('cityCode')}
                            optionFilterProp="children"
                            filterOption={(input, option) => slugify((option?.label ?? '')).includes(slugify(input))}
                            filterSort={(optionA, optionB) =>
                              slugify((optionA?.label ?? '')).localeCompare(slugify((optionB?.label ?? '')))
                            }
                            options={locations.cities.map((item, index) => {
                                return {
                                    label: item.name_with_type,
                                    value: item.code
                                }
                            })}
                        />
                    </div>
                </div>
                <div className="item_type_of_asset px-2 ">
                    {/* <div className="title_item_type">
                        <p className="pb-0 mb-1">{trans[locate].dicstrict}</p>
                    </div> */}
                    <div className="input-group mb-3">
                        <Select
                            showSearch
                            placeholder={trans[locate].choose_district}
                            style={{ width: '100%' }}
                            value={values.districtCode || null}
                            onChange={onChangeData('districtCode')}
                            filterOption={(input, option) => slugify((option?.label ?? '')).includes(input)}
                            filterSort={(optionA, optionB) =>
                              slugify((optionA?.label ?? '')).localeCompare(slugify((optionB?.label ?? '')))
                            }
                            options={locations.districts.filter(item => item.parent_code == values.cityCode).map((item, index) => {
                                return {
                                    label: item.name_with_type,
                                    value: item.code
                                }
                            })}
                        />
                    </div>
                </div>
                <div className="item_type_of_asset px-2  ">
                    {/* <div className="title_item_type">
                        <p className="pb-0 mb-1">{trans[locate].ward}</p>
                    </div> */}
                    <div className="input-group mb-3">
                        <Select
                            showSearch
                            placeholder={trans[locate].choose_ward}
                            style={{ width: '100%' }}
                            value={values.wardCode || null}
                            filterOption={(input, option) => slugify((option?.label ?? '')).includes(input)}
                            filterSort={(optionA, optionB) =>
                              slugify((optionA?.label ?? '')).localeCompare(slugify((optionB?.label ?? '')))
                            }
                            onChange={onChangeData('wardCode')}
                            options={locations.wards.filter(item => item.parent_code == values.districtCode).map((item, index) => {
                                return {
                                    label: item.name_with_type,
                                    value: item.code
                                }
                            })}
                        />
                    </div>
                </div>

            </div>

            <style jsx global>
                {`
                    span.ant-select-selection-placeholder, span.ant-select-arrow{
                        color: #000000d9;
                    }
                `}
            </style>
        </>
    )
}