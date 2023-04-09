import { locateSelector } from "@store/locate/locate.slice"
import { useSelector } from "react-redux"
import { trans } from "src/resources/trans"


export default function Empty(){
    const {locate} = useSelector(locateSelector)
    return (
        <div className="d-flex justify-content-center">
            {trans[locate].no_data}
        </div>
    )
}