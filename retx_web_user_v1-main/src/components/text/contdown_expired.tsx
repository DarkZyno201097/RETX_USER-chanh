import moment from "moment"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

import { locateSelector } from "@store/locate/locate.slice"
import { trans } from "src/resources/trans"

interface IProps {
    expired: any,
    onExpired: () => void
}

export default function CountdownExpired(props: IProps) {

    const [min, setMin] = useState(1)
    const [sec, setSec] = useState(1)
    const [change, setChange] = useState(1)
    const {locate} = useSelector(locateSelector)

    useEffect(() => {
        console.log("Expired: ", moment(props.expired).format("YYYY-MM-DD HH:mm:ss"))
        let momentNow = moment()
        let momentExpired = moment(props.expired)
        let _min = momentExpired.diff(momentNow, 'm')
        let _sec = momentExpired.diff(momentNow, 's')
        setMin(min => _min)
        setSec(sec => parseFloat(((_sec / 60 - _min) * 60).toFixed(0)))

        if (sec >= 0 || min >= 0)
            setTimeout(() => {
                setChange(change => change + 1)
            }, 1000);
    }, [change])

    useEffect(() => {
        if (min == 0 && sec <= 0) {
            props.onExpired()
            setMin(min => 0)
            setSec(sec => 0)
        }
    }, [sec, min])



    return (
        <>
            <span> {min >= 0 ? min : 0} {trans[locate].minute} {sec >= 0 ? sec : 0} {trans[locate].second}</span>
        </>
    )
}