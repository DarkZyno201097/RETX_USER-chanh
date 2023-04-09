import { useSelector } from "react-redux";
import router from "next/router";

import { routeNames } from "@utils/router";
import { trans } from "src/resources/trans";
import RegBtnSubmit from "./btn_submit";
import { locateSelector } from "@store/locate/locate.slice";


export default function RegFormStep4() {

    const {locate} = useSelector(locateSelector)

    return (
        <div className="d-flex flex-column align-items-center">
            <a onClick={() => router.push(routeNames.home)}  role="button" style={{
                fontSize: '1.2rem',
                // backgroundColor: '#FEC128',
                width: 35, height: 35,
                borderRadius: 5,
                color: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: 5, right: 5,
                border: '1px solid #3333'
            }}>
                <i style={{ color: '#FEC128' }} className="fa-solid fa-xmark-large"></i>
            </a>
            
            <div className="title">
                <h5 className="text-center" style={{}}>
                    <pre>{trans[locate].do_yout_want_to_perform_identity}?</pre>
                </h5>
            </div>

            <div className="mt-4 w-100">
                <RegBtnSubmit type="next" title={trans[locate].next} onClick={() => router.push(routeNames.kyc)} />
            </div>
            <div className="mt-3 w-100">
                <RegBtnSubmit type="later" title={trans[locate].later} onClick={() => router.push(routeNames.home)} />
            </div>

            <h6 className="mt-3 text-center" style={{maxWidth: 400}}>
                {trans[locate].only_kyc_verified_accounts_can}
            </h6>

        </div>
    )
}