import { locateActions } from "@store/actions";
import { locateSelector } from "@store/locate/locate.slice";
import { Select } from "antd"
import { useDispatch, useSelector } from "react-redux";


const { Option } = Select;


export default function ButtonLang() {
    const dispatch = useDispatch()
    const { locate } = useSelector(locateSelector)


    return (
        <>
            <Select
                value={locate}
                style={{ width: 80 }}
                onChange={value => {
                    dispatch(locateActions.switchLocate(value))
                }}
                autoFocus={false}
            >
                <Option value="en" disabled={locate == 'en'}>
                    <div className="d-flex align-items-center gap-1">
                        <img src="/img/en-flag-icon.png" /> <span>EN</span>
                    </div>
                </Option>
                <Option value="vi" disabled={locate == 'vi'}>
                    <div className="d-flex align-items-center gap-1">
                        <img src="/img/vi-flag-icon.png" /> <span>VI</span>
                    </div>
                </Option>

            </Select>
        </>
    )
}