import { assetApi } from "@apis/index";
import { assetActions, authActions, contractActions } from "@store/actions";
import { assetSelector } from "@store/asset/asset.slice";
import { authSelector } from "@store/auth/auth.slice";
import { contractSelector } from "@store/contract/contract.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { formatCurrency } from "@utils/number";
import { routeNames } from "@utils/router";
import { useMetaMask } from "metamask-react";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import { trans } from "src/resources/trans";
import ButtonLang from "./button-lang";
import SearchBox from "./search-box";


interface IProps {
    setSwitchMenu: (value: boolean) => void;
    switchMenu: boolean
    searchSubmit: (e: ChangeEvent<HTMLFormElement>) => void;
    setShowHistorySearchMobile: (value: boolean) => void;
    showHistorySearchMobile: boolean
}

export default function HeaderMobile({
    setSwitchMenu,
    switchMenu,
    searchSubmit,
    setShowHistorySearchMobile,
    showHistorySearchMobile
}: IProps) {

    const dispatch = useDispatch()
    const router = useRouter()
    const {
        textSearchingProduct,
        cart
    } = useSelector(assetSelector)
    const {
        authenticated,
        user
    } = useSelector(authSelector)
    const { locate } = useSelector(locateSelector)
    const { balance, decimals, loadingBalance, loadedInfoContracts, web3Contract } = useSelector(contractSelector)
    const { status, connect, account, chainId, ethereum } = useMetaMask();
    const [loadingGetProductSuggest, setLoadingGetProductSuggest] = useState(false)
    const [productSuggest, setProductSuggest] = useState<RealEstateAssetView[]>([])


    const logout = () => {
        if (window.location.pathname == routeNames.profile) {
            Router.push(routeNames.home)
            setTimeout(() => {
                dispatch(authActions.logout())
            }, 1000);
        }
        else dispatch(authActions.logout())
    }

    const pushRoute = (name: string) => {
        Router.push(name)
        setSwitchMenu(false)
    }

    // const doSearch = async () => {
    //     try {
    //       setLoadingGetProductSuggest(true)
    //       let res = await assetApi.getAssets({
    //         page: 1,
    //         limit: 10,
    //         search: textSearchingProduct,
    //         filterObj: !textSearchingProduct ? { timeCreated: 'asc' } : {}
    //       })
    //       setProductSuggest(res.data)
    //     }
    //     catch (e) {
    //       console.log("🚀 ~ file: header.tsx ~ line 703 ~ e", e)
    //     }
    //     finally {
    //       setLoadingGetProductSuggest(false)
    //     }
    //   }
    
    //   useEffect(() => {
    //     doSearch()
    //   }, [textSearchingProduct])

    return (
        <>
            {/* Mobile */}
            <div className="container d-flex align-items-center justify-content-between gap-2 px-3 py-1 d-xl-none">
                <div className="d-flex align-items-center gap-2">
                    <a
                        role="button"
                        style={{
                            fontSize: '2rem',
                            color: '#ff8c10'
                        }}
                        onClick={() => setSwitchMenu(!switchMenu)} data-action="show" >
                        <i className="fa-solid fa-bars"></i>
                    </a>
                    {/* Logo Text */}
                    <Link legacyBehavior href="/">
                        <a>
                            <img style={{ width: 85 }} src="/img/logo-text-retx.svg" className="logo-text" alt="RETX" />
                        </a>
                    </Link>
                    {/* Logo */}
                </div>

                {/* Button lang */}
                <div>
                    <ButtonLang />
                </div>

            </div>
            {/* Sidebar */}
            <aside className="fixed-top sidebar d-xl-none" style={{
                transform: `translateX(${switchMenu ? 0 : '-100%'})`
            }}>
                <div className="container p-4">
                    <div className="d-flex align-items-center gap-4">
                        <a
                            role="button"
                            style={{
                                fontSize: '2rem',
                                color: '#f80'
                            }}
                            onClick={() => setSwitchMenu(!switchMenu)} data-action="hide" >
                            <i className="fa-solid fa-bars"></i>
                        </a>
                        {/* Search form (Mobile) */}
                        <form method="GET" action={routeNames.product} className="flex-grow-1 form-search" style={{ position: "relative" }} >
                            <div style={{ border: '1px solid #00000042', borderRadius: 5, overflow: 'hidden' }} className="input-group d-flex justify-content-between">
                                <input
                                    onMouseDown={() => setShowHistorySearchMobile(true)}
                                    onBlur={() => setShowHistorySearchMobile(false)}
                                    onChange={(e) => dispatch(assetActions.self.onSearching(e.target.value))}
                                    value={textSearchingProduct}
                                    type="text"
                                    name="search"
                                    className="form-control-input-search"
                                    placeholder={trans[locate].text_search_bar}
                                />
                                <div className="input-group-append">
                                    <button className="" type="submit">
                                        <i className="fa-regular fa-magnifying-glass"></i>
                                    </button>
                                </div>
                            </div>

                            {/* <SearchBox
                                onClickItem={() => {
                                    dispatch(assetActions.getDataProducts({
                                        page: 1,
                                    }))
                                }}
                                loadingGetProductSuggest={loadingGetProductSuggest}
                                productSuggest={productSuggest}
                            /> */}

                            {showHistorySearchMobile && (
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
                </div>

                {/* Unauthenticated */}
                {!authenticated && (

                    <div className="grid grid-cols-2 gap-3 container p-4 pt-0">
                        <Link legacyBehavior href={routeNames.register}>
                            <a className="btn-redirect-auth btn-register rounded-1 fs-3 text-center d-flex justify-content-center align-items-center text-decoration-none p-2 ">
                                {trans[locate].register}
                            </a>
                        </Link>

                        <Link legacyBehavior href={routeNames.login}>
                            <a onClick={() => Router.push(routeNames.login)} className="btn-redirect-auth btn-login rounded-1 fs-3 text-center d-block text-decoration-none p-2">
                                {trans[locate].login}
                            </a>
                        </Link>
                    </div>
                )}


                {/* Authenticated */}
                {authenticated && (
                    <div className="mt-2">
                        <div className="d-flex align-items-center gap-3 container px-4">
                            {/* User */}
                            <div className="d-flex align-items-center label-action">
                                <a onClick={() => router.push(routeNames.profile)} role="button">
                                    <div onClick={() => router.push(routeNames.profile)} className="label-circle position-relative" style={{
                                        backgroundImage: `url(${user?.avatarUrl || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'})`,
                                        backgroundPosition: 'center',
                                        backgroundSize: 'cover',
                                        // border: '1px solid #505050'
                                    }} />
                                </a>
                                <div className="ms-2 d-flex flex-column header--text-fullname">
                                    <a onClick={() => Router.push(routeNames.profile)} role="button" className="a-none d-flex fw-bold mb-0" style={{ color: '#332f6a' }}>
                                        {user?.name?.split(" ").length >= 4 ? user?.name?.split(" ").slice(0, 2).toString().replaceAll(',', ' ') + "..." + user?.name?.split(" ").slice(-1) : user?.name || user.email?.split('@')[0]}
                                    </a>
                                    <a role="button" style={{ color: '#332f6a' }} onClick={() => logout()} >{trans[locate].logout}</a>
                                </div>
                            </div>
                            {/* Cart */}
                            <a role={'button'} onClick={() => router.push(routeNames.profile + "?tab=cart")} className="d-flex align-items-center ms-auto label-action me-3">
                                <div className="label-circle cart-action position-relative">
                                    <span className="position-absolute translate-middle badge rounded-pill fw-normal py-1 px-2">{cart.length}</span>
                                </div>
                            </a>
                        </div>

                        {!authenticated && (
                            <div className="btn-callable fs-5 text-center p-2 mt-4">
                                {trans[locate].welcome_retx}
                            </div>
                        )}

                        {user.kycStatus == 'verified' && authenticated ? (
                            <div className="btn-callable fs-5 text-center p-2 mt-4">
                                {trans[locate].balance}: {!!balance && decimals != null && decimals != undefined ? formatCurrency(parseInt(balance.toString()).toFixed(0)) : "0"} VND
                                <a role={'button'} onClick={() => dispatch(contractActions.loadBalance(user.walletAddress))} className="a-none ms-2 reload" >
                                    <i className={`fa-regular fa-arrows-rotate ${loadingBalance && 'loader'} fs-6`}></i>
                                </a>
                            </div>
                        ) : user.kycStatus == 'pending' && !!user.hasUploadedKyc && authenticated ? (
                            <div className="btn-callable fs-5 text-center p-2 mt-4">
                                {trans[locate].kyc_pending}
                            </div>)
                            : authenticated ? (
                                <div onClick={() => router.push(routeNames.kyc)} className="btn-callable fs-5 text-center p-2 mt-4" style={{ cursor: 'pointer' }}>
                                    {trans[locate].verify_kyc}
                                </div>
                            ) : null
                        }

                    </div>
                )}

                {/* Navigation */}
                <nav className="d-flex header--nav gap-2 flex-column container p-4 fs-3">
                    <Link legacyBehavior href={routeNames.home}>
                        <a>
                            {trans[locate].header.home}
                        </a>
                    </Link>
                    <Link legacyBehavior href={routeNames.product}>
                        <a >
                            {trans[locate].header.marketplace}
                        </a>
                    </Link>
                    <a role="button" onClick={() => pushRoute("/?pageTo=news")}>
                        {trans[locate].header.news}
                    </a>
                    <Link legacyBehavior href={routeNames.partner}>
                        <a>{
                            trans[locate].header.partner
                        }</a>
                    </Link>
                    <Link legacyBehavior href={routeNames.human}>
                        <a>
                            {trans[locate].header.about_us}
                        </a>
                    </Link>
                    <Link legacyBehavior href={routeNames.contact}>
                        <a >
                            {trans[locate].header.contact}
                        </a>
                    </Link>
                </nav>
                {/* Logo */}
                <div className="container d-flex justify-content-left p-4">
                    <img src="/img/Logo_RETX.svg" alt="RETX" style={{ width: '220px' }} />
                </div>
            </aside>
        </>
    )
}