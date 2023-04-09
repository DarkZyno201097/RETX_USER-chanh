import PageLayout from "@layouts/page";
import { locateSelector } from "@store/locate/locate.slice";
import { routeNames } from "@utils/router";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function PolicyPage() {
    const router = useRouter()
    const {locate} = useSelector(locateSelector)

    useEffect(()=>{
        let lang = localStorage.getItem('locate')
        if (locate == lang)
        router.push(routeNames.policy(lang))
    },[locate])

    return (
        <PageLayout>
            <section
                style={{
                    backgroundImage: 'url(/img/bg-contact.png)',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }}
                className="content py-5">
                <div className="container">
                    <h3 className="section__title--border-bottom">
                        TERMS OF USE
                    </h3>

                    <div className="content--box">
                        <h6>
                            Read carefully using the website before using this website ("website"). Terms of using this website ("Terms of use") Manage access and use this website. The website is available only for access and use provided that you agree with the terms of use below. If you do not agree with all the terms of non -access use or website use. By accessing or using the website, you and your organization are authorized to represent ("you" or "youR") indicating your agreement is subject to ties with the terms of use.
                        </h6>

                        <h4>
                            1. Calculation of user status
                        </h4>
                        <h6>
                            The site is provided by RETX and only provided to companies and individuals over the age of law, those who can make legal contracts under the law applicable. . If you are not qualified, you are not allowed to use the website.
                        </h6>

                        <h4>
                            2.The terms of use
                        </h4>
                        <h6>
                            These terms use the usage of web addresses and all applications, software, and services (called, "service") available at the web address, except for services subject to terms adjustment of separate contracts. Private terms or contracts may be applied to other services or items provided to you on the web address ("Service contract"). Service contracts that come with the service can be applied or listed via super links that come with the services applied.
                        </h6>

                        <h4>
                            3. Modify
                        </h4>
                        <h6>
                            RETX can edit or update the terms used at any time. Continuing to use the web address after any changes to the terms of use means you accept these changes. Any aspect of the web address can be changed, supplemented, deleted or updated without notice according to RETX's wishes. RETX may change or apply fees for products and services via the web address at any time. RETX can set or change, at any time, common practices and limits related to other products and services arbitrary.
                        </h6>

                        <h4>
                            4. Terms and services of RETX
                        </h4>
                        <h6>
                            RETX terms and conditions ("RETX's terms and conditions") applies to transportation and related services provided by RETX, the use of shipping services and other services RETX's relevant services received through this website, in addition to other terms and conditions that can be applied to such transactions as specified in the terms of this website and (site). Service. RETX's terms and service conditions are combined into these terms, so that all references in this Terms of Use will be considered to include RETX's terms and service conditions, Within the scope of application
                        </h6>

                        <h4>
                            5. Information sent via website and services
                        </h4>
                        <h6>
                            The fact that you send information via the website and service will be adjusted according to these terms of use. You declare and make sure that any information you provide through the website or service is still accurate and complete, and you will maintain and update that information when needed.
                            <br />
                            For any individual that you provide their personal information to RETX through the website and service, you commit to RETX that you have the right to provide that information and you have provided all notices. Necessary as well as getting all the necessary consent for processing that information according to the service you are using.
                        </h6>

                        <h4>
                            6. License and ownership
                        </h4>
                        <h6>
                            Any and all intellectual property rights ("Intellectual Property") related to web addresses and content ("content") are the only asset of RETX, branches and third parties. The content is protected by the law and other laws in the United States and other countries. The components of the web address are protected by commercial laws, commercial secrets, unfair competition laws and other laws and must not copy or imitate all or parts. All images, symbols, and other contents appear on the website are brands, service or commercial brands ("brands") of RETX, branches or other organizations that have granted power and Licenses to use those brands and may not be used or intervened in any form without a written approval of RETX. If not allowed to use, you are not allowed to copy, reprint, amend, lease, lend, sell, create works that arise from, upload, transmit, or spread ownership The wisdom of the website in any form without a written consent of RETX or third party. Not specified in this document, RETX does not licenses you or the intellectual property of RETX or third party.
                            <br />
                            RETX provides you with a restrictive, individual, non -transferred license, without re -granting a license, which can be recovered to (A) access and use the website, content and service of RETX in the form of Due to RETX, and (b) access and use of computers and RETX network provided in the website ("RETX of the system") only in the form allowed by RETX. Except for this restriction license, RETX does not care about the RETX, information or data systems available via the RETX system ("Information"), content, service, website or any asset As RETX by allowing you to access the website. If the law is not allowed or not specified in this document, any part of the content and/or information are edited, modified, reproduced, re -published, translated into any language or Which computer computer language, transmitted in any form, resell or redistribute without the written consent of RETX. You cannot create, sell, offer, revise, regenerate, display, open, import, distribute, transmit or use content in any form without permission in writing of RETX.
                        </h6>

                        <h4>
                            7. WEBSURANCE REPORT
                        </h4>
                        <h6>
                            In addition to the limitations mentioned in the terms of use, you agree:
                            <br />
                            (a) You do not hide the source of information transmitted through the website.
                            <br />
                            (b) You do not give fake information on the website.
                            <br />
                            (c) You will not use or access any services, information, applications or software available through the website in any form without being allowed by RETX.
                            <br />
                            (d) You do not enter or upload any information related to viruses, horses into Roa, worms, time bombs or computer programming applications for the purpose of sabotage, intervention, blanket or deprivation win any system, website or information violation of intellectual property rights (determined below).
                            (e) Some areas on the website are limited to RETX customers.
                            <br />
                            (f) You may not use or visit the website or system or RETX service in any way, but according to RETX, which has a disadvantage of the operation or function of the system, service or web site Or interfere with the ability of the system to access the system, service or websites.<br />
                            (g) You must not create or use the frame creation technique to accompany any part or aspect of the content or information without the written permission of RETX.
                            <br />
                        </h6>
                    </div>

                </div>
            </section>

        </PageLayout>
    )
}