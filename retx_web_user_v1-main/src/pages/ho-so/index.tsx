import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
import Clamp from 'react-multiline-clamp';
import Resizer from "react-image-file-resizer";
import { CircleSpinner, SwishSpinner } from "react-spinners-kit";
import cookie from 'react-cookies'

import { alertActions, assetActions, authActions, settingActions } from "@store/actions";
import ProfileNav from "@components/navbar/profile_nav";
import ProfileAssets from "@components/profile/single_assets";
import ProfileCart from "@components/profile/cart";
import ProfileChangePassword from "@components/profile/change_password";
import ProfileInfo from "@components/profile/info";
import ProfileTopUp from "@components/profile/top_up";
import PageLayout from "@layouts/page";
import { authSelector } from "@store/auth/auth.slice";
import { settingSelector, TProfileTab } from "@store/setting/setting.slice";
import ModalBase from "@components/modal";
import { userApi } from "@apis/index";
import { trans } from "src/resources/trans";
import { locateSelector } from "@store/locate/locate.slice";
import ProfileMyRatting from "@components/profile/my_rating";
import ProfileHistoryTransaction from "@components/profile/history_transactions";
import ProfileCollectionAsset from "@components/profile/collection_asset";




export default function ProfilePage() {

    const router = useRouter()
    const dispatch = useDispatch()

    const { profileTab } = useSelector(settingSelector)
    const { authenticated, user, loadingAuthenticate } = useSelector(authSelector)
    const { locate } = useSelector(locateSelector)

    const [switchMenu, setSwitchMenu] = useState(false);

    const resizeFile = (file: File): Promise<File> =>
        new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,
                500,
                500,
                "JPEG",
                90,
                0,
                (uri: File) => {
                    resolve(uri);
                },
                "file"
            );
        });
   
    useEffect(() => {
        let tab = router.query['tab'] as string;
        if (!!tab) {
            dispatch(settingActions.self.switchProfieTab(tab as any))
        }
        else {
            dispatch(settingActions.self.switchProfieTab('information'))
        }
    }, [router.query])

    const copy = (text: string) => {
        navigator.clipboard.writeText(user?.walletAddress)
        dispatch(alertActions.alertSuccess(trans[locate].copy_successfully))
      }

    useEffect(() => {
        // dispatch(assetActions.getAssets({
        //     type: 'realEstate',
        //     limit: 150,
        //     page: 1
        // }))
    }, [])

    useEffect(() => {
        if (!cookie.load('access_token')) {
            router.push('/')
        }
        else if (!loadingAuthenticate) {
            if (!authenticated) router.push('/')
        }
    }, [loadingAuthenticate, authenticated])

    if (authenticated)
        return (
            <PageLayout>

              

                {authenticated ? (
                    <main className="my-5">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-3" style={{borderRight: '1px solid #cacaca'}} >
                                    <div className="profile-nav--box">
                                        <div
                                            style={{
                                                // backgroundColor: '#8585854f',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                height: '100%',
                                                width: '100%',
                                                zIndex: -1,
                                                borderRadius: 15
                                            }}
                                        />
                                       
                                        <div className="mt-3 d-flex align-items-center gap-2 d-xl-none">
                                            <button onClick={() => setSwitchMenu(!switchMenu)} className="button profile-nav--switch gap-2">
                                                <span>
                                                    {switchMenu ? (
                                                        <i style={{ fontSize: 20, transform: 'scale(1.1)' }} className="fa-sharp fa-solid fa-chevron-up"></i>
                                                    ) : (
                                                        <i style={{ fontSize: 20, transform: 'scale(1.1)' }} className="fa-sharp fa-solid fa-chevron-down"></i>
                                                    )}
                                                </span>
                                            </button>
                                            <h5 className="m-0">
                                               {trans[locate][profileTab]}
                                            </h5>
                                        </div>

                                        {switchMenu && (
                                            <div className="mt-3">
                                                <ProfileNav setSwitchMenu={setSwitchMenu} />
                                            </div>
                                        )}
                                        <div className="d-none d-xl-block" >
                                            <div className="mt-5"></div>
                                            <ProfileNav />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-9 mt-3 mt-xl-0">

                                    <div className="mb-5" style={{padding: '0 20px'}}>
                                        <h3>
                                            {trans[locate][profileTab]}
                                        </h3>
                                    </div>

                                    {profileTab == 'deposit_withdraw' && (
                                        <div className="profile-content">
                                            <ProfileTopUp />
                                        </div>
                                    )}

                                    {profileTab == 'history_transaction_VND' && (
                                        <div className="profile-content">
                                            <ProfileHistoryTransaction />
                                        </div>
                                    )}

                                    {profileTab == 'collection_asset' && (
                                        <div className="profile-content">
                                            <ProfileCollectionAsset />
                                        </div>
                                    )}

                                    {profileTab == 'single_asset' && (
                                        <div className="profile-content">
                                            <ProfileAssets />
                                        </div>
                                    )}
                                    {profileTab == 'information' && (
                                        <div className="profile-content">
                                            <ProfileInfo />
                                        </div>
                                    )}
                                    {profileTab == 'cart' && (
                                        <div className="profile-content">
                                            <ProfileCart />
                                        </div>
                                    )}
                                    {profileTab == 'change_password' && (
                                        <div className="profile-content">
                                            <ProfileChangePassword />
                                        </div>
                                    )}
                                    {profileTab == 'my_rating' && (
                                        <div className="profile-content">
                                            <ProfileMyRatting />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                ) : (
                    <>
                    </>
                )}

            </PageLayout>
        )
    else return <PageLayout>
        <div className="d-flex justify-content-center align-items-center" style={{
            position: 'fixed',
            backgroundColor: '#fff',
            zIndex: true ? 999 : -1,
            width: '100%',
            height: '100%',
            top: 0,
            transition: 'all .7s',
            opacity: true ? 1 : 0
        }}>
            {true && (
                <>
                    <SwishSpinner frontColor="#ffc027" size={100} />
                    <div style={{
                        minHeight: '100vh'
                    }} />
                </>
            )}
        </div>
    </PageLayout>
}