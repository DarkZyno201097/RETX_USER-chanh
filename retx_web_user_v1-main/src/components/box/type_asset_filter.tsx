import { Button, Checkbox, Col, Row, Select } from "antd"
import { useSelector } from "react-redux"

import { locateSelector } from "@store/locate/locate.slice"
import { IFilterAssetOption } from "src/models/asset/filter_options"
import { trans } from "src/resources/trans"
import { FormRealEstateAsset } from "src/models/asset/form-real-estate.model"
import { useState } from "react"
import { slugify } from "@utils/string"


interface IRealEstateInfo {
    id: string;
    translates: {
        [key: string]: any
    }
}

interface IProps {
    filterOptions: IFilterAssetOption,
    onChangeFilter?: (filterValue: any) => void,
    listForm: FormRealEstateAsset[],
    closeIcon?: boolean,
    onClose?: (value: boolean) => void,
    hiddenConfirm?: boolean,
    values: string[],
    onChange: (values: string[]) => void,
}

export default function TypeAssetFilter({ filterOptions, onChangeFilter, listForm, closeIcon, onClose, hiddenConfirm, values, onChange}: IProps) {

    const { locate, locations } = useSelector(locateSelector)

    const clearAll = () => {
        // onChangeFilter([])
        onChange([])
    }

    return (
        <div className="product-list--box__right">
            <div className="type_of_asset col-12  p-0 ">
                <div className="title_type p-2 d-flex justify-content-between">
                    <span style={{ color: '#505050', fontWeight: 600 }}>{trans[locate].type_project}</span>
                    {filterOptions.form.length > 0 && (
                        <Button size='small' onClick={clearAll}>
                            {trans[locate].unchecked}
                        </Button>
                    )}
                </div>
            </div>
            <div className="item_type_of_asset col-12 px-2 ">
                <div className="mb-2">
                    <Select
                        mode="multiple"
                        placeholder={trans[locate].select_a_project_type}
                        showArrow
                        value={values}
                        onChange={onChange}
                        style={{ width: '100%' }}
                        options={listForm?.map((item) => {
                            return {
                                label: item.name[locate],
                                value: item._id
                            }
                        })}
                        optionFilterProp="children"
                        filterOption={(input, option) => slugify((option?.label ?? '')).includes(slugify(input))}
                        filterSort={(optionA, optionB) =>
                            slugify((optionA?.label ?? '')).toLowerCase().localeCompare(slugify((optionB?.label ?? '')).toLowerCase())
                        }
                    />
                </div>
                {!hiddenConfirm && (
                    <div>
                        <Button
                            onClick={() => {
                                onChangeFilter(values)
                            }}
                            block
                        >
                            {trans[locate].confirm}
                        </Button>

                    </div>
                )}

            </div>
        </div>
    )
}