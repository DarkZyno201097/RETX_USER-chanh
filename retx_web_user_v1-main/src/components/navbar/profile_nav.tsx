import { CircleSpinner } from "react-spinners-kit"
import { useDispatch, useSelector } from "react-redux"
import {  useRouter } from "next/router"
import cookie from 'react-cookies'
import { useState } from "react"

import { authActions, settingActions } from "@store/actions"
import { locateSelector } from "@store/locate/locate.slice"
import { settingSelector, TProfileTab } from "@store/setting/setting.slice"
import { routeNames } from "@utils/router"
import { trans } from "src/resources/trans"
import { authApi, userApi } from "@apis/index"

interface IProps {
    setSwitchMenu?: (value) => void
}

export default function zProfileNav({setSwitchMenu}: IProps) {

    const dispatch = useDispatch()
    const router = useRouter()

    const {profileTab} = useSelector(settingSelector)
    const {locate} = useSelector(locateSelector)
    const [loadingLogout, setLoadingLogout] = useState(false)

    const switchTab = (tab: TProfileTab) => {
        dispatch(settingActions.self.switchProfieTab(tab))
        router.push('?tab='+tab)
        try{
            setSwitchMenu(false)
        }
        catch(err){

        }
    }

    const logout = async () => {
        setLoadingLogout(true)
        try{
            await authApi.logout()
            cookie.remove('access_token', {path: '/'})
            cookie.save("noti_not_match_address", 1, {path: '/', maxAge: 10 })
            router.push(routeNames.home, undefined, {shallow: true})
        }
        catch(err){
            console.log(err)

        }
        setLoadingLogout(false)
    }

    return (
        <div className="profile-nav--list">
             <a onClick={() => switchTab('information')} role="button" className={`a-none profile-nav--item gap-2 ${profileTab == 'information' && 'active'}`}>
                <span><i className="fa-regular fa-circle-info"></i></span>
                <span>{trans[locate].information}</span>
            </a>
            <a onClick={() => switchTab('collection_asset')} role="button" className={`a-none profile-nav--item gap-2 ${profileTab == 'collection_asset' && 'active'}`}>
                <span><i className="fa-regular fa-chart-tree-map"></i></span>
                <span>{trans[locate].collection_asset}</span>
            </a>
            <a onClick={() => switchTab('single_asset')} role="button" className={`a-none profile-nav--item gap-2 ${profileTab == 'single_asset' && 'active'}`}>
                <span><i className="fa-regular fa-house"></i></span>
                <span>{trans[locate].single_asset}</span>
            </a>
            <a onClick={() => switchTab('deposit_withdraw')} role="button" className={`a-none profile-nav--item gap-2 ${profileTab == 'deposit_withdraw' && 'active'}`}>
                <span><i className="fa-solid fa-money-bill-transfer"></i></span>
                <span>{trans[locate].deposit_withdraw}</span>
            </a>

            <a onClick={() => switchTab('history_transaction_VND')} role="button" className={`a-none profile-nav--item gap-2 ${profileTab == 'history_transaction_VND' && 'active'}`}>
                <span><i className="fa-regular fa-people-arrows"></i></span>
                <span>{trans[locate].history_transaction_VND}</span>
            </a>
           
            <a onClick={() => switchTab('cart')} role="button" className={`a-none profile-nav--item gap-2 ${profileTab == 'cart' && 'active'}`}>
                <span><i className="fa-regular fa-cart-shopping"></i></span>
                <span>{trans[locate].cart}</span>
            </a>
            <a onClick={() => switchTab('change_password')} role="button" className={`a-none profile-nav--item gap-2 ${profileTab == 'change_password' && 'active'}`}>
                <span><i className="fa-regular fa-lock"></i></span>
                <span>{trans[locate].change_password}</span>
            </a>
            <a onClick={() => switchTab('my_rating')} role="button" className={`a-none profile-nav--item gap-2 ${profileTab == 'my_rating' && 'active'}`}>
                <span><i className="fa-regular fa-star"></i></span>
                <span>{trans[locate].my_rating}</span>
            </a>
            <a onClick={logout} className={`a-none profile-nav--item gap-2 `}>
                {!loadingLogout && (
                    <span><i className="fa-regular fa-arrow-right-from-bracket"></i></span>
                )}
                <span>
                    <CircleSpinner loading={loadingLogout} color="#e29925" size={25} />
                </span>
                <span>{trans[locate].logout}</span>
                
            </a>
            <a target="_blank" href={routeNames.policy(locate)} role="button" className={`text-center w-100 d-block mt-3 `} style={{fontSize: 14, textDecoration: 'underline', fontStyle: 'italic', color: '#1a76f2'}} >
                <span>{trans[locate].user_is_tern_and_privacy_policy}</span>
            </a>
        </div>
    )
}