import React, { Component, ReactNode, useEffect, useState } from 'react';
import { Modal } from 'antd';
import { SwishSpinner } from 'react-spinners-kit';
import Web3 from 'web3';
import { useMetaMask } from "metamask-react";
import { useDispatch, useSelector } from 'react-redux';

import { alertActions, assetActions, authActions, bannerActions, contractActions, locateActions } from '@store/actions';
import Footer from '@components/containers/footer';
import Header from '@components/containers/header';
import { alertSelector } from '@store/alert/alert.slice';
import { contractSelector } from '@store/contract/contract.slice';
import { trans } from 'src/resources/trans';
import { locateSelector } from '@store/locate/locate.slice';
import { authSelector } from '@store/auth/auth.slice';
import { bannerSelector } from '@store/banner/banner.slice';
import { useRouter } from 'next/router';
import { routeNames } from '@utils/router';

interface IProps {
    children: ReactNode,
    empty?: boolean
}


export default function PageLayout({ children, empty }: IProps) {
    const router = useRouter()
    const dispatch = useDispatch()
    const { modalNoti } = useSelector(alertSelector)
    const { status, connect, account, chainId, ethereum } = useMetaMask();
    const { loadedInfoContracts } = useSelector(contractSelector)
    const { locate, locations } = useSelector(locateSelector)
    const { authenticated, user } = useSelector(authSelector)
    const { banners } = useSelector(bannerSelector)


    useEffect(() => {
        if (loadedInfoContracts) {
            try {
                if (!['0x61', '0x97'].includes(chainId)){
                    throw new Error ('ChainId not supported')
                }
                else{
                    let Window: any = window;
                    let web3 = new Web3(Window.web3.currentProvider)
                    dispatch(contractActions.self.setupWeb3Contract({ web3 }))
                }
            }
            catch (e) {
                console.log(e)
                // console.log("NOT MetaMask")
                console.log("process.env.PRC_URL_DEFAULT: ", process.env.PRC_URL_DEFAULT)
                dispatch(contractActions.self.setupWeb3Contract({ web3: new Web3(process.env.PRC_URL_DEFAULT) }))
            }
        }
    }, [status, loadedInfoContracts, account, authenticated])


    useEffect(() => {
        if (status != "initializing" && status != "connecting") {
          console.log("status: ", status);
          console.log("chainId: ", chainId);
          if (chainId && ["0x61", "0x97"].includes(chainId))
            dispatch(contractActions.loadContracts(chainId));
          else {
            dispatch(
              contractActions.loadContracts(
                process.env.CHAIN_ID_HEX_DEFAULT,
              )
            );
          }
        }
      }, [status]);

    useEffect(() => {
        if (locations.cities.length == 0)
        setTimeout(() => {
            dispatch(locateActions.getLocations())
        }, 700);
      
        dispatch(authActions.authenticate())

        if (router.pathname == routeNames.contact)
        dispatch(locateActions.getContact())

        let locate = localStorage.getItem('locate');
        if (locate) {
            dispatch(locateActions.switchLocate(locate as any))
        }

        let history_search = localStorage.getItem('search_history');
        if (!history_search) localStorage.setItem('search_history', JSON.stringify([]))

        dispatch(alertActions.closeAll())
    }, [])

    useEffect(() => {
      if (banners.length == 0 && router.pathname == routeNames.home)
        dispatch(bannerActions.getBanners());
    }, [router]);

    useEffect(() => {
        if (authenticated) {
            dispatch(assetActions.loadCart())
        }
    }, [authenticated])

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 700);
    }, [])

    return (
        <>
            {!empty && (
                <Header />

            )}

            <div className="d-flex justify-content-center align-items-center" style={{
                position: 'fixed',
                backgroundColor: '#fff',
                zIndex: loading ? 999 : -1,
                width: '100%',
                height: '100%',
                top: 0,
                transition: 'all .7s',
                opacity: loading ? 1 : 0
            }}>
                {loading && (
                    <>
                        <SwishSpinner frontColor="#ffc027" size={100} />
                        <div style={{
                            minHeight: '100vh'
                        }} />
                    </>
                )}
            </div>

            <Modal title={trans[locate].notification} visible={modalNoti.visible} footer={null} onCancel={() => { dispatch(alertActions.closeModalNoti()) }}>
                <div>
                    <p>{modalNoti.message}</p>
                </div>
            </Modal>

            {children}

            {!empty && (
                <Footer />

            )}
        </>
    )

}
