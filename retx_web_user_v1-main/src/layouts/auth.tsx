import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Link from 'next/link';

import { authActions, contractActions, locateActions } from '@store/actions'
import { locateSelector } from "@store/locate/locate.slice";
import { trans } from 'src/resources/trans';
import { routeNames } from '@utils/router';
import { authSelector } from '@store/auth/auth.slice';
import ButtonLang from '@components/containers/header/button-lang';
import Header from '@components/containers/header';



interface IProps {
    children: ReactNode,
    onBack?: () => void,
    step: number,
    stepHasBack: number[]

}

export default function AuthLayout({ children, onBack, step, stepHasBack }: IProps) {

    const dispatch = useDispatch()
    const Router = useRouter()



    const { locate } = useSelector(locateSelector)
    const { authenticated, user } = useSelector(authSelector)

    const [switchMenu, setSwitchMenu] = useState(false)
    const [showBtnLogin, setShowBtnLogin] = useState(false)



    const pushRoute = (name: string) => {
        Router.push(name)
        setSwitchMenu(false)
    }

    useEffect(() => {
        let pathname = window.location.pathname;
        if (pathname != '/') {
            setShowBtnLogin(true)
        }
        else {
            setShowBtnLogin(false)
        }


    }, [])




    return (
        <div className="auth-page">
            <div style={{
                position: "absolute",
                top: 0, left: 0,
                width: "100%",
            }}>
               <Header authPage />

            </div>

            <div className="auth-page--bg"></div>

            <div className="container">
                <div className="w-100 auth-page--form-box d-flex justify-content-center align-items-center" style={{ position: 'relative' }}>
                    {stepHasBack.indexOf(step) >= 0 && (
                        <a onClick={onBack} role="button" style={{
                            fontSize: '1.2rem',
                            // backgroundColor: '#FEC128',
                            width: 35, height: 35,
                            borderRadius: 5,
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            top: 5, left: 5,
                            border: '1px solid #3333'
                        }}>
                            <i style={{ color: '#FEC128' }} className="fa-regular fa-chevron-left"></i>
                        </a>
                    )}
                    {children}
                </div>
            </div>
        </div>
    )
}