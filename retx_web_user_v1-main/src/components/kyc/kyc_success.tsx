import { useSelector } from "react-redux";
import router from "next/router";

import { locateSelector } from "@store/locate/locate.slice";
import { routeNames } from "@utils/router";
import { trans } from "src/resources/trans";



export default function KycSuccess() {

    const { locate } = useSelector(locateSelector)

    return (
        <>
            <a onClick={() => router.push(routeNames.home)} role="button" style={{
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

            <h5 className="mt-4 text-uppercase text-center">
                <pre className="d-xl-block d-none">{trans[locate].identity_verification_process_is_complete}</pre>
                <span className="d-block d-xl-none">{trans[locate].identity_verification_process_is_complete}</span>
                
            </h5>

            <div className="mt-4">
                <i className="fa-solid fa-shield-check fs-1" style={{ color: '#32C671' }}></i>
            </div>

        </>
    )
}