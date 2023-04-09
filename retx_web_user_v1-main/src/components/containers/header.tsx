import Link from "next/link";
import Router, { useRouter } from 'next/router';
import router from "next/router";
import { Modal, Select, Spin } from 'antd';
import { Tooltip } from 'antd'
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMetaMask } from "metamask-react";
import { LoadingOutlined } from '@ant-design/icons';


import { alertActions, assetActions, authActions, contractActions, locateActions } from "@store/actions";
import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { routeNames } from "@utils/router";
import { trans } from "src/resources/trans";
import { assetSelector } from "@store/asset/asset.slice";
import LinkVerifyAddress from "@components/modal/link_verify_address";
import { contractSelector } from "@store/contract/contract.slice";
import { divValueBlock, formatCurrency } from "@utils/number";
import ModalBase from "@components/modal";
import { assetApi, userApi } from "@apis/index";
import { slugify } from "@utils/string";
import Image from "next/image";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import { ClassicSpinner } from "react-spinners-kit";
import ButtonLang from "./header/button-lang";
import HeaderMobile from "./header/header-mobile";
import SearchBox from "./header/search-box";
import Networks from '@utils/networks.json'

const { Option } = Select;

interface IProps {
  authPage?: boolean
}

export default function Header(props: IProps) {
  const dispatch = useDispatch()
  const router = useRouter()
  const { authenticated, user, loadingAuthenticate, } = useSelector(authSelector)
  const { textSearchingProduct, cart, loadingDataProducts } = useSelector(assetSelector)
  const { locate } = useSelector(locateSelector)
  const { status, connect, account, chainId, ethereum } = useMetaMask();
  const { balance, decimals, loadingBalance, loadedInfoContracts, web3Contract } = useSelector(contractSelector)
  const [switchMenu, setSwitchMenu] = useState(false)
  const [showBtnLogin, setShowBtnLogin] = useState(false)
  const [showHistorySearchDesktop, setShowHistorySearchDesktop] = useState(false)
  const [showHistorySearchMobile, setShowHistorySearchMobile] = useState(false)
  const [visibleModalVerifyWallet, setVisibleModalVerifyWallet] = useState(false)

  useEffect(() => {
    let pathname = window.location.pathname;
    if (pathname != '/') {
      setShowBtnLogin(true)
    }
    else {
      setShowBtnLogin(false)
    }
  }, [])

  useEffect(() => {
    let search = router.query.search as string || ''
    dispatch(assetActions.self.onSearching(search))
  },[router])
 


  const searchSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(assetActions.self.onChangeSearch(textSearchingProduct))
    setSwitchMenu(false)

    router.push(routeNames.product + `?search=${textSearchingProduct}`)
  }


  const copy = (text: string) => {
    navigator.clipboard.writeText(user?.walletAddress)
    dispatch(alertActions.alertSuccess(trans[locate].copy_successfully))
  }

  const connectWeb3 = async () => {
    if (status == 'unavailable') {
      dispatch(alertActions.reWarnEnableMetamask(trans[locate].you_need_install_metamask))
      return;
    }
    else{
      // await connect()
    }
    // setIsConfirm(true)
    setVisibleModalVerifyWallet(true)
  }


  const [networkMetamask, setNetworkMetamask] = useState<'BNB_TESTNET' | 'N/A'>(null)

  const switchBNBNetwork = async () => {

    if (status == 'unavailable') {
      dispatch(alertActions.reWarnEnableMetamask(trans[locate].you_need_install_metamask))
      return;
    }

    if (status != 'connected') {
      await connect()
      const chainIdCurrent = await ethereum.request({
        method: 'eth_chainId',
      })
      if (chainIdCurrent != '0x61') {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }], // chainId must be in hexadecimal numbers
        });
        setNetworkMetamask('BNB_TESTNET')
      }

    }
    else {

      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }], // chainId must be in hexadecimal numbers
        });
      }
      catch (err) {
        console.log(err)
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x61',
            chainName: 'Binance Smart Chain Testnet',
            nativeCurrency: {
              name: 'Binance Coin',
              symbol: 'BNB',
              decimals: 18
            },
            rpcUrls: [Networks.find(item => item.chain_id_hex == '0x61')?.url_prc],
          }]
        })
          .catch((error) => {
            console.log(error)
          })
      }
    }

  }

  const [loadingNet, setLoadingNet] = useState(false)

  useEffect(() => {
    (async () => {
      setLoadingNet(true)
      if (ethereum && status == 'connected') {
        const chainIdCurrent = await ethereum.request({
          method: 'eth_chainId',
        })
        if (chainIdCurrent == '0x61') {
          setNetworkMetamask('BNB_TESTNET')
          console.log('networkMetamask: ', "BNB_TESTNET")
        }
        else {
          setNetworkMetamask('N/A')
          console.log('networkMetamask: ', "N/A")
        }
      }
      else {
        setNetworkMetamask(null)
      }
      setLoadingNet(false)
    })()
  }, [ethereum, chainId, status])


  const [showModalSwitchNet, setShowModalSwitchNet] = useState(false)

  useEffect(() => {
    if (!loadingNet && networkMetamask) {
      if (status == 'connected' && !loadingNet) {
        if (networkMetamask == 'N/A') {
          setShowModalSwitchNet(true)
          console.log(true);
        }
      }
    }
    else setShowModalSwitchNet(false)
  }, [loadingAuthenticate, status, loadingNet, networkMetamask, chainId])

  useEffect(() => {
    if (web3Contract.stableCoin && user.walletAddress) {
      dispatch(contractActions.loadBalance(user.walletAddress))
    }
  }, [web3Contract, account, user])


  const [productSuggest, setProductSuggest] = useState<RealEstateAssetView[]>([])
  const [loadingGetProductSuggest, setLoadingGetProductSuggest] = useState(false)

  const doSearch = async () => {
    try {
      setLoadingGetProductSuggest(true)
      const regex = /[-[\]{}()*+?.,\\^$|#\s]/g; // Regular expression to match special characters
      const queryWithQuotes = `"${textSearchingProduct.replace(regex, '\\$&')}"`; // Wrap the query with quotes and escape special characters
      console.log("🚀 ~ file: header.tsx:225 ~ doSearch ~ queryWithQuotes:", queryWithQuotes)
      
      let res = await assetApi.getAssets({
        page: 1,
        limit: 10,
        search: textSearchingProduct,
        filterObj: !textSearchingProduct ? { timeCreated: 'asc' } : {}
      })
      setProductSuggest(res.data)
    }
    catch (e) {
      console.log("🚀 ~ file: header.tsx ~ line 703 ~ e", e)
    }
    finally {
      setLoadingGetProductSuggest(false)
    }
  }

  useEffect(() => {
    if (showHistorySearchDesktop || showHistorySearchMobile)
    doSearch()
  }, [showHistorySearchDesktop, showHistorySearchMobile])


  useEffect(() => {
    if (showHistorySearchDesktop || showHistorySearchMobile)
    if (!loadingGetProductSuggest && !loadingDataProducts) {
      const timeOutId = setTimeout(async () => {
        await doSearch()
      }, 1000);
      return () => clearTimeout(timeOutId);
    }
  }, [textSearchingProduct]);

  


  return (
    <div className="section-header">
      <ModalBase visible={visibleModalVerifyWallet} onCancel={() => {setVisibleModalVerifyWallet(false) }} width={500}>
        <div className="p-3 bg-white" style={{borderRadius: 5}}>
        <LinkVerifyAddress onDone={() => {
          setVisibleModalVerifyWallet(false)
        }} />
        </div>
      </ModalBase>
      

      <ModalBase visible={showModalSwitchNet} onCancel={() => { }} width={500}>
        <div className="w-100 bg-white p-3">

          <h5 className="text-uppercase">
            {trans[locate].check_your_metamask_network}
          </h5>

          <div className="my-4">
            <h6 className="text-danger text-center mb-4" style={{ fontWeight: 600 }}>
              {trans[locate].we_currently_do_not_support_this_network}
            </h6>
            <img src="/img/icon-liuliu.png" alt="image" width={100} className="mx-auto d-block" />

            <div className="alert alert-danger mx-auto text-center mt-4" role="alert" style={{ maxWidth: 350, fontWeight: 600 }}>
              {trans[locate].please_select_your_network_to_continue}
            </div>

            <button onClick={switchBNBNetwork} className="btn-primary-light mx-auto d-block py-3" style={{ width: 350, fontSize: '1rem', textTransform: 'inherit', fontWeight: 600 }}>
              {trans[locate].network_switch_in_wallet}
            </button>
          </div>

        </div>
      </ModalBase>

      {/* Top banner */}
      <div id="top-banner" className="d-none d-xl-block py-1">
        <div className="container d-flex justify-content-end align-items-center gap-3 px-3">
          <div className="d-flex justify-content-end w-100">
            <Select placeholder={trans[locate].not_connected_to_the_network} value={networkMetamask != 'N/A' ? networkMetamask : null}
              style={{ width: 300, borderRadius: 5 }}
              onChange={value => {
                if (value == 'BNB_TESTNET')
                  switchBNBNetwork()
              }}>
              <Option value="BNB_TESTNET">BNB Smart Chain Testnet</Option>
              <Option value="MDAP_DEVNET" disabled>MetaDAP Devnet ({trans[locate].developing})</Option>
              <Option value="MDAP_MAINNET" disabled>MetaDAP Mainnet ({trans[locate].developing})</Option>
            </Select>
          </div>

          <div>
            <ButtonLang />
          </div>

        </div>
      </div>

      {/* Banner */}
      {!props.authPage && (
        <div id="banner" className="d-none d-xl-flex align-items-center" style={{ height: 95 }}>
          <div className="container">
            <div className="row">
              <div className="col-9 d-flex align-items-center gap-4 px-3">
                <div className="d-flex gap-4 align-items-center position-relative">
                  <img src={locate == "en" ? "/img/Logo_RETX.svg" : "/img/Logo_RETX.svg"} alt="logo" style={{ width: 150 }} />
                  <a href="/" className="stretched-link" />
                </div>
                {/* Search form (Desktop) */}
                <form onSubmit={searchSubmit} method="GET" className="flex-grow-1 form-search" style={{ position: "relative" }} >
                  <div style={{ border: '1px solid #00000042', borderRadius: 5, overflow: 'hidden' }} className="input-group d-flex justify-content-between">
                    <input
                      onMouseDown={() => setShowHistorySearchDesktop(true)}
                      onBlur={() => setShowHistorySearchDesktop(false)}
                      onChange={(e) => dispatch(assetActions.self.onSearching(e.target.value))}
                      value={textSearchingProduct}
                      type="text"
                      className="form-control-input-search"
                      placeholder={trans[locate].text_search_bar}
                    />
                    <div className="input-group-append">
                      <button className="" type="submit">
                        <i className="fa-regular fa-magnifying-glass"></i>
                      </button>
                    </div>
                  </div>

                  {/* <SearchBox onClickItem={() => { }} /> */}

                  {showHistorySearchDesktop && (
                    <SearchBox
                      onClickItem={() => {
                        dispatch(assetActions.getDataProducts({
                          page: 1,
                        }))
                      }}
                      loadingGetProductSuggest={loadingGetProductSuggest}
                      productSuggest={productSuggest}
                    />
                  )}

                </form>
              </div>
              <div className="col-3 px-3">
                <div className="d-flex align-items-center justify-content-between gap-3 py-4">
                  {authenticated && (
                    <>
                      {/* Cart */}
                      <a role={'button'} onClick={() => router.push(routeNames.profile + "?tab=cart")} className="d-flex align-items-center label-action">
                        <div className="label-circle cart-action position-relative">
                          <span className="position-absolute translate-middle badge rounded-pill fw-normal py-1">{cart.length}</span>
                        </div>
                      </a>
                      <div className="d-flex align-items-center label-action">
                        <div onClick={() => router.push(routeNames.profile)} className="label-circle position-relative" style={{
                          backgroundImage: `url(${user?.avatarUrl || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'})`,
                          backgroundPosition: 'center',
                          backgroundSize: 'cover',
                          // border: '1px solid #505050',
                          cursor: 'pointer'
                        }}>
                        </div>
                        <div className="ms-2 flex flex-column">

                          <Tooltip placement="top" title={user.name || user.email}>
                            <a role="button" style={{ color: '#777777' }} onClick={() => router.push(routeNames.profile)} className="fw-bold mb-0 d-block d-flex">
                              {/* {trans[locate].my_account} */}
                              {user?.name?.split(" ").length >= 3 ? user?.name?.split(" ")[0] + "..." + user?.name?.split(" ").slice(-1) : user?.name || user.email?.split('@')[0]}
                            </a>
                          </Tooltip>
                          {/* <a role="button" onClick={() => logout()} >{trans[locate].logout}</a> */}
                          {status == 'connected' && !!user.walletAddress && (
                            <div className="d-flex align-items-center">
                              <Tooltip placement="bottom" title={account == user.walletAddress ? account : trans[locate].correct_wallet_address + `: ${user.walletAddress}`} >
                                <h6 className="d-flex m-0" style={{ ...account.toLowerCase() != user.walletAddress.toLowerCase() ? { color: 'red' } : {}, fontSize: 14 }} >
                                  {account.toLowerCase() == user.walletAddress.toLowerCase() ? `${user.walletAddress.slice(0, 4)} ... ${user.walletAddress.slice(-4)}` : trans[locate].wrong_wallet_address}
                                </h6>
                              </Tooltip>

                              <a onClick={() => {
                                copy(user.walletAddress)
                              }} className="copy a-none" role="button">
                                <i className="fa-regular fa-copy"></i>
                              </a>
                            </div>
                          )}

                          {status != 'connected' || !user.walletAddress ? (
                            <div className="d-flex align-items-center gap-2 btn-callable h-100 justify-content-center d-flex align-items-center fw-bold header--btn-login__container">
                              <i className="fa-light fa-wallet"></i>
                              {!user.walletAddress ? (
                                <a onClick={() => connectWeb3()} className="header--btn-login__text text-black" role={'button'} style={{ textTransform: 'capitalize' }} >
                                  {trans[locate].verify_wallet}
                                </a>
                              ) : (
                                <a onClick={() => connectWeb3()} className="header--btn-login__text text-black" role={'button'} style={{ textTransform: 'capitalize' }} >
                                  {trans[locate].connect_web3}
                                </a>
                              )}
                            </div>
                          ) : null}

                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header id="header">
        {/* Desktop */}
        {!props.authPage && (
          <div className="container d-none d-xl-block desktop" >
            <div className="row" style={{ backgroundColor: '#eff1fd',}}>
              <div className="col-9">
                {/* Navigation */}
                <nav className=" header--nav d-flex align-items-center" style={{ height: 40 }}>
                  <Link legacyBehavior href={routeNames.home}>
                    <a className="d-flex px-3 py-2 align-items-center gap-2" style={{ height: '100%', lineHeight: 0, alignItems: 'center', textTransform: 'capitalize' }} >
                      {trans[locate].header.home}
                    </a>
                  </Link>
                  <a role="button" onClick={() => Router.push(routeNames.product)} className="d-flex px-3 py-2" style={{ height: '100%', lineHeight: 0, alignItems: 'center', textTransform: 'capitalize' }}>
                    {trans[locate].header.marketplace}
                  </a>
                  <Link legacyBehavior href="/?pageTo=news">
                    <a className="d-flex px-3 py-2" style={{ height: '100%', lineHeight: 0, alignItems: 'center', textTransform: 'capitalize' }}>
                      {trans[locate].header.news}
                    </a>
                  </Link>
                  <Link legacyBehavior href={"/?pageTo=partner"}>
                    <a role="button" className="d-flex px-3 py-2" style={{ height: '100%', lineHeight: 0, alignItems: 'center', textTransform: 'capitalize' }}>
                      {trans[locate].header.partner}
                    </a>
                  </Link>
                  <a role="button" onClick={() => Router.push(routeNames.human)} className="d-flex px-3 py-2" style={{ height: '100%', lineHeight: 0, alignItems: 'center', textTransform: 'capitalize' }}>
                    {trans[locate].header.about_us}
                  </a>
                  <a role="button" onClick={() => Router.push(routeNames.contact)} className="d-flex px-3 py-2" style={{ height: '100%', lineHeight: 0, alignItems: 'center', textTransform: 'capitalize' }}>
                    {trans[locate].header.contact}
                  </a>
                </nav>
              </div>
              <div className="col-3" style={{ paddingRight: 0, paddingLeft: 20 }}>
                {/* Desktop */}
                {!authenticated && (
                  <>
                    {showBtnLogin ? (

                      <Link legacyBehavior href={routeNames.login}>
                        <a className="btn-callable h-100 justify-content-center d-flex align-items-center fw-bold header--btn-login__container">
                          <a role="button" className="header--btn-login__text" style={{ textTransform: 'capitalize' }} > {trans[locate].login_and_connect_web3} </a>
                        </a>
                      </Link>
                    ) : (
                      <div className="btn-callable h-100 justify-content-center d-flex align-items-center fw-bold">
                        {trans[locate].welcome_retx}
                      </div>
                    )}
                  </>
                )}

                {user.kycStatus == 'verified' && authenticated ? (
                  <div className="btn-callable h-100 justify-content-center d-flex align-items-center fw-bold">
                    {status != 'connected' && (
                      <span>{trans[locate].wallet_not_connected}</span>
                    )}
                    {status == 'connected' && account.toLowerCase() != user?.walletAddress.toLowerCase() && (
                      <span>{trans[locate].wallet_connection_is_not_completed}</span>
                    )}
                    {status == 'connected' && account.toLowerCase() == user?.walletAddress.toLowerCase() && (
                      <span>
                        {trans[locate].balance}: {!!balance && decimals != null && decimals != undefined ? formatCurrency(parseInt(balance.toString()).toFixed(0)) : "0"} VND
                        <a role={'button'} onClick={() => dispatch(contractActions.loadBalance(account))} className="a-none ms-2 reload" >
                          <i className={`fa-regular fa-rotate-right ${loadingBalance && 'loader'} fs-6`}></i>
                        </a>
                      </span>
                    )}
                  </div>
                ) : user.kycStatus == 'pending' && !!user.hasUploadedKyc && authenticated ? (
                  <div className="btn-callable h-100 justify-content-center d-flex align-items-center fw-bold">
                    {trans[locate].kyc_pending}
                  </div>
                ): authenticated && (
                  <Link legacyBehavior href={routeNames.kyc}>
                    <a className="btn-callable h-100 justify-content-center d-flex align-items-center fw-bold header--btn-login__container">
                      <a role="button" className="header--btn-login__text" style={{ textTransform: 'capitalize' }} > {trans[locate].verify_kyc} </a>
                    </a>
                  </Link>
                )}


              </div>
            </div>
          </div>
        )}

        <HeaderMobile
          setSwitchMenu={setSwitchMenu}
          switchMenu={switchMenu}
          searchSubmit={searchSubmit}
          setShowHistorySearchMobile={setShowHistorySearchMobile}
          showHistorySearchMobile={showHistorySearchMobile}
        />
      </header>
    </div>
  )
}


