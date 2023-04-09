import { useSelector } from 'react-redux'

import { locateSelector } from '@store/locate/locate.slice'
import { routeNames } from '@utils/router'
import { trans } from 'src/resources/trans'
import Link from 'next/link'

export default function Footer() {

    const { contact } = useSelector(locateSelector)
    const { locate } = useSelector(locateSelector)

    return (
        <footer>
            <div className="container py-3 py-xl-5">
                <div className="row mx-0">
                    <div className="col-12 col-xl-4 py-4">
                        <div style={{ width: '15rem', maxWidth: '100%' }} className="mx-xl-0">
                            <img style={{ width: 193 }} src={"/img/logo-retx.svg"} alt="" />
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-xl-4 py-4">
                        <h3 className="text-black mb-3">
                            {trans[locate].footer.usefull_links}
                        </h3>
                        <nav className="links d-flex flex-column gap-2">
                            <div>
                                <a href="/" className="d-flex-inline align-items-center text-capitalize">
                                    <img src="/img/yellow-angle-right-icon.png" className="me-1 inline-block" />
                                    <span>
                                        {trans[locate].header.home}
                                    </span>
                                </a>
                            </div>
                            <div>
                                <a href={routeNames.marketplace} className="d-flex-inline align-items-center text-capitalize">
                                    <img src="/img/yellow-angle-right-icon.png" className="me-1 inline-block" />
                                    <span>{trans[locate].header.marketplace}</span>
                                </a>
                            </div>
                            <div>
                                <Link legacyBehavior href={'/?pageTo=news'}>
                                    <a className="d-flex-inline align-items-center text-capitalize">
                                        <img src="/img/yellow-angle-right-icon.png" className="me-1 inline-block" />
                                        <span>
                                            {trans[locate].header.news}
                                        </span>
                                    </a>
                                </Link>
                            </div>
                            <div>
                                <Link legacyBehavior href={'/?pageTo=partner'}>
                                    <a className="d-flex-inline align-items-center text-capitalize">
                                        <img src="/img/yellow-angle-right-icon.png" className="me-1 inline-block" />
                                        <span>
                                            {trans[locate].header.partner}
                                        </span>
                                    </a>
                                </Link>
                            </div>
                            <div>
                                <a href={routeNames.human} className="d-flex-inline align-items-center text-capitalize">
                                    <img src="/img/yellow-angle-right-icon.png" className="me-1 inline-block" />
                                    <span>{trans[locate].header.about_us}</span>
                                </a>
                            </div>
                            <div>
                                <a href={routeNames.contact} className="d-flex-inline align-items-center text-capitalize">
                                    <img src="/img/yellow-angle-right-icon.png" className="me-1 inline-block" />
                                    <span>{trans[locate].header.contact}</span>
                                </a>
                            </div>
                        </nav>
                    </div>

                    <div className="col-12 col-sm-6 col-xl-4 py-4">
                        <h3 className="text-black mb-3">{trans[locate].footer.social_media}</h3>
                        <div className="d-flex gap-4">
                            <a href={contact?.facebookUrl || '#'} className="social-circle">
                                <img style={{ width: 31 }} src="/img/icon-fb.svg" />
                            </a>
                            <a href={contact?.youtubeUrl || '#'} className="social-circle">
                                <img style={{ width: 31 }} src="/img/icon-zalo.svg" />
                            </a>
                            <a href={contact?.zaloUrl || '#'} className="social-circle">
                                <img style={{ width: 31 }} src="/img/icon-youtube.svg" />
                            </a>
                        </div>

                        <div className="text-black mt-4 fw-light mx-xl-0 mx-0" style={{ width: '17rem' }}>
                            <p>Viện Phát triển Kinh tế số Việt Nam</p>
                            <p>{trans[locate].address}: {contact.address}</p>
                            <p>{trans[locate].phone}: {contact.hotline}</p>
                            <p className="mb-0">Email: {contact.email}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container">
                    <div className="d-flex justify-content-xl-between w-100 justify-content-center">
                        <div className='d-flex gap-2 gap-xl-4 flex-column flex-xl-row align-items-center'>
                            <Link legacyBehavior href={routeNames.policy(locate)}>
                                <a style={{ color: '#FFA800', fontWeight: 600 }}>
                                    {trans[locate].term}
                                </a>
                            </Link>
                            <span style={{ color: '#4D5461' }}>RETX © 2022 All rights reserved</span>
                        </div>
                        <div className='d-none d-xl-flex gap-4' style={{ color: '#9EA3AE' }}>
                            <span>Power by <b style={{ color: '#212936' }}>Viện Phát triển Kinh tế số Việt Nam</b></span>
                            <span>Power by <b style={{ color: '#212936' }}>MetaDap</b></span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>


    )
}