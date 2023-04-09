
import { useDispatch, useSelector } from 'react-redux'
import { CircleSpinner, ClapSpinner, FlapperSpinner } from 'react-spinners-kit';
import Router, { useRouter } from 'next/router';
import dynamic from 'next/dynamic'
// import Skeleton from 'react-loading-skeleton'
import { Component, useEffect, useRef, useState } from 'react'

import PageLayout from '@layouts/page'
import TitleWidthFull from '@components/text/title_w_full';
import ProductItem from '@components/box/product_item';
import { assetSelector } from '@store/asset/asset.slice';
import { RealEstateAssetView } from 'src/models/asset/real_estate.model';
import { alertActions, assetActions, authActions } from '@store/actions';
import { locateSelector } from '@store/locate/locate.slice';
import NewsContainer from '@components/containers/news_container';
import HumanContainer from '@components/containers/human_container';
import { routeNames } from '@utils/router';
import { trans } from 'src/resources/trans';
import { authSelector } from '@store/auth/auth.slice';
import SliderCaptchaBox from '@components/slider_captcha';
import { assetApi } from '@apis/index';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from 'antd';

const DynamicSliderBanner = dynamic(
  () => import('@components/slider/slider_banner'),
  { ssr: false }
)

const DynamicSliderNews = dynamic(
  () => import('@components/slider/slider_news'),
  { ssr: false }
)

export default function HomePage() {

  const dispatch = useDispatch()
  const router = useRouter()
  const { assets, firstGetAssets } = useSelector(assetSelector)
  const { locate, locations } = useSelector(locateSelector)
  const { loadingLogin, authenticated } = useSelector(authSelector)


  const bannerRef = useRef<HTMLDivElement>()
  const boxLoadingRef = useRef<HTMLDivElement>()

  const [change, setChange] = useState(0)
  const [newAssets, setNewAssets] = useState<RealEstateAssetView[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [warningCaptcha, setWarningCaptcha] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [isMobile, setIsMobile] = useState(false)

  const [currentLoadPrice, setCurrentLoadPrice] = useState(0)

  useEffect(() => {
    (async () => {
      try {
        setLoadingAssets(true)
        let { data } = await assetApi.getAssets({
          limit: 8,
          page: 1,
          filterObj: { timeCreated: 'asc' }
        })
        setNewAssets(data.map(item => new RealEstateAssetView(item)))

      }
      catch (err) {
        console.log(err)
      }
      finally {
        setLoadingAssets(false)
      }
    })()
  }, [])

  useEffect(() => {
    let width = window.innerWidth;
    if (width < 1200) {
      setIsMobile(true)
    }
    else setIsMobile(false)
  }, [])


  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')

  useEffect(() => {
    setPhoneNumber('')
    setPassword('')
  }, [])

  const login = (e: any) => {
    e.preventDefault();
    setFormErrors({})
    let errors = {};
    setWarningCaptcha(false)
    let errorCaptcha = false
    console.log("captchaToken:", captchaToken)

    if (!phoneNumber) errors['phoneNumber'] = 'msg_error_input_require'
    if (!password) errors['password'] = 'msg_error_input_require'

    if (!captchaToken) errorCaptcha = true;

    if (Object.keys(errors).length > 0 || errorCaptcha == true) {
      console.log(errors)
      setWarningCaptcha(true);
      setFormErrors(errors);
      return;
    }
    else {
      dispatch(authActions.login({
        phoneNumber, password,
        locate,
        captchaToken
      }))
    }
  }

  useEffect(() => {
    if (assets.realEstate.length > 0) {
      let temp = [...assets.realEstate]
      // console.log()
      setNewAssets(temp.sort((a, b) => - new Date(a.createdAt).getTime() + new Date(b.createdAt).getTime()).slice(0, isMobile ? 4 : 8))
    }
  }, [assets.realEstate, isMobile])

  useEffect(() => {
    let temp = { ...formErrors }
    delete temp['phoneNumber']
    setFormErrors(temp)
  }, [phoneNumber])

  useEffect(() => {
    let temp = { ...formErrors }
    delete temp['password']
    setFormErrors(temp)
  }, [password])

  const newsRef = useRef<HTMLDivElement>(null)
  const partnerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let pageTo = router.query.pageTo
    if (pageTo == `news` && newsRef) {
      window.scrollTo(0, newsRef.current?.offsetTop - 200);
    }
    else if (pageTo == `partner` && partnerRef) {
      window.scrollTo(0, partnerRef.current?.offsetTop - 200);
    }
  }, [router, loadingAssets])

  return (
    <PageLayout>

      {/* BANNER */}
      <section className="banner pt-xl-4 pt-3">
        <div className="container">
          <div className="row">
            <div ref={bannerRef} className="col-12 col-xl-9 pe-4">
              <DynamicSliderBanner />
            </div>

            {!authenticated && (
              <div className="col-xl-3 d-none d-xl-block" style={{ paddingRight: 0, paddingLeft: 19 }}>
                <div className="d-flex justify-content-center align-items-center flex-column" style={{
                  backgroundImage: `url(/img/bg-contact.png)`,
                  backgroundPosition: 'right',
                  backgroundSize: 'cover',
                  width: '100%',
                  height: '100%',
                  borderRadius: 5,
                  // border: '1px solid #ACACAC',

                }} >

                  <form className="px-3 w-100 d-flex justify-content-center align-items-center flex-column">
                    <h5 className="mb-2" style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {trans[locate].login}
                    </h5>
                    <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} type="text" className="login--input" placeholder={trans[locate].phone_number + "/ " + trans[locate].email} />
                    {formErrors['phoneNumber'] && <h6 className="auth-page--input-message-error">{trans[locate][formErrors['phoneNumber']]}</h6>}

                    <div className="mt-1"></div>

                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="login--input" placeholder={trans[locate].password} />
                    {formErrors['password'] && <h6 className="auth-page--input-message-error">{trans[locate][formErrors['password']]}</h6>}


                    <div className="mt-0 d-flex justify-content-end w-100">
                      <a href={routeNames.forgotPassword} className="a-none" style={{ color: '#555555' }} >{trans[locate].forgot_password}</a>
                    </div>

                    <div className="w-100 mt-1">
                      <SliderCaptchaBox
                        onVerifySuccess={(token) => {
                          setWarningCaptcha(false)
                          setCaptchaToken(token)
                        }}
                        warning={warningCaptcha}
                      />
                    </div>

                    <button onClick={login} className="btn-primary-dark w-100 my-2 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#747474' }}>
                      {loadingLogin ? <CircleSpinner size={20} /> : (
                        trans[locate].login_and_connect_web3
                      )}
                    </button>
                  </form>

                  <div className="w-100 text-center mt-2" style={{ color: '#747474' }}>
                    {trans[locate].no_account}
                  </div>

                  <div className="px-3 w-100">
                    <a
                      href={routeNames.register}
                      className="btn-primary-light border-0 mx-auto d-block w-100 a-none text-center" style={{
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                      {trans[locate].register_now}
                    </a>

                  </div>
                </div>
              </div>
            )}

            {authenticated && (
              <div className="col-xl-3 d-none d-xl-block" style={{ paddingRight: 0, paddingLeft: 19 }}>
                <div className="d-flex justify-content-between align-items-center flex-column py-2" style={{
                  backgroundImage: `url(/img/homepage-img.png)`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  width: '100%',
                  height: '100%',
                  borderRadius: 5,
                  // border: '1px solid #ACACAC'
                }} >
                </div>

              </div>
            )}

          </div>
        </div>
      </section>
      {/* END BANNER */}

      <div className="mt-4 pt-1 pt-sm-1 mt-sm-5"></div>

      {/* MARKETPLACE */}
      <section id="product" style={{
        backgroundColor: '#FFF6E5'
      }}>
        <TitleWidthFull title={trans[locate].new_product} textButton={trans[locate].view_all} hrefButton={routeNames.product} />
        {/* <div style={{ marginTop: '1rem' }}></div> */}
        <div className="section container main pb-1 mt-xl-0 mt-4">
          <div className="content row">

            {loadingAssets && (
              <div className='col-xl-3 col-6 p-2 m-0 pb-4'>
                <Skeleton active />
              </div>
            )}

            {
              !loadingAssets && newAssets.map((item: RealEstateAssetView, index: number) => (
                <ProductItem
                  key={item._id}
                  asset={item}
                  className="col-xl-3 col-6 p-2 m-0 pb-4"
                />
              ))
            }


            <div className="mt-2"></div>
          </div>
        </div>
      </section>
      {/* END MARKETPLACE */}

      {/* PARTNER */}
      <section ref={partnerRef} id="partner">
        <TitleWidthFull title={trans[locate].metadap_partner} textButton={trans[locate].view_all} hrefButton={routeNames.partner} />
        <HumanContainer title="Advisor" type="partner" />
      </section>
      {/* END PARTNER */}

      {/* NEWS */}
      <section ref={newsRef}>
        <TitleWidthFull title={trans[locate].company_news} textButton={trans[locate].view_all} hrefButton={`${routeNames.news}/company`} />
        <div className='container mt-4'>
          <DynamicSliderNews type="company" />
        </div>

      </section>

      <section>
        <TitleWidthFull title={trans[locate].market_news} textButton={trans[locate].view_all} hrefButton={`${routeNames.news}/company`} />
        <div className='container mt-4'>
          <DynamicSliderNews type='market' />
        </div>

      </section>
      {/* END NEWS */}

      <section className='explore-section mt-5'>
        <img className='icon-building left d-none d-md-block' src='/img/icon-building-left.svg' alt='icon' />
        <img className='icon-building right d-none d-md-block' src='/img/icon-building-right.svg' alt='icon' />

        <div className='d-flex justify-content-center align-items-center flex-column text-center content' style={{ zIndex: 1 }}>
          <h3 className='title'>RETX</h3>
          <h2 className='mb-3'>
            {trans[locate]['explore-section-paragraph-1']}
          </h2>
          <h3>
            {trans[locate]['explore-section-paragraph-2']}
          </h3>

          <Link legacyBehavior href={routeNames.product}>
            <a className='a-none btn-explore'>
              {trans[locate].explore_now}
            </a>
          </Link>
        </div>
      </section>

    </PageLayout>
  )
}