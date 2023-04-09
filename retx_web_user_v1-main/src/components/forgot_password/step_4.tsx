import { useSelector } from "react-redux";

import { locateSelector } from "@store/locate/locate.slice";
import { trans } from "src/resources/trans";



export default function ForgotPassStep4() {

    const { locate } = useSelector(locateSelector)

    return (
        <>
            <a href={"/"} role="button" style={{
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
                {trans[locate].change_password_successfully}
            </h5>

            <div className="mt-4">
                <i className="fa-solid fa-circle-check fs-1" style={{ color: '#32C671' }}></i>
            </div>

        </>
    )
}