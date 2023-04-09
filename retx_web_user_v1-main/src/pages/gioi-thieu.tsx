import { useDispatch, useSelector } from "react-redux";
import dynamic from 'next/dynamic'

import PageLayout from "@layouts/page";
import HumanContainer from "@components/containers/human_container";
import { locateSelector } from "@store/locate/locate.slice";
import { trans } from "src/resources/trans";

export default function HumanPage() {
    const {locate} = useSelector(locateSelector)

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
                        {trans[locate].about_paragraph_0}
                    </h3>

                    <div className="content--box">
                        <div className="mb-1">
                            <b>MetaDAP</b> {trans[locate].about_paragraph_1}
                        </div>
                        <div className="mb-1">
                            {trans[locate].about_paragraph_2}
                        </div>
                        <div className="mb-1">
                            {trans[locate].about_paragraph_3}
                        </div>
                    </div>

                    <div className="content--box">
                        <div className="mb-1">
                            <b><u>{trans[locate].about_paragraph_4}</u></b>
                        </div>
                        <div className="mb-1">
                            + {trans[locate].about_paragraph_5}
                        </div>
                        <div className="mb-1">
                            + {trans[locate].about_paragraph_6}
                        </div>
                        <div className="mb-1">
                            + {trans[locate].about_paragraph_7}
                        </div>
                        <div className="mb-4" />
                        <div className="mb-1">
                            <b><u>{trans[locate].about_paragraph_8}</u>
                            </b>
                        </div>
                        <div className="mb-1">
                        {trans[locate].about_paragraph_9}
                        </div>
                        <div className="mb-1">
                        {trans[locate].about_paragraph_10} 
                        </div>
                        <div className="mb-4"></div>
                        <div className="mb-1">
                            <b><u>{trans[locate].about_paragraph_11}</u></b>
                        </div>
                        <div className="mb-1">
                        {trans[locate].about_paragraph_12}
                        </div>

                        <div className="mb-4"></div>
                        <div className="mb-1">
                            <b><u>
                            {trans[locate].about_paragraph_13}
                                </u></b>
                        </div>
                        <div className="mb-1">
                        {trans[locate].about_paragraph_14}
                        </div>

                        <div className="mb-4"></div>
                        <div className="mb-1">
                            <b><u>
                           {trans[locate].about_paragraph_15}
                                </u></b>
                        </div>
                        <div className="mb-1">
                        {trans[locate].about_paragraph_16}
                        </div>
                    </div>
                </div>
            </section>

            <div className="section-space"></div>

            <HumanContainer title="RETX Team" type="team" />

            <div className="section-space"></div>
            <HumanContainer title="Advisor" type="advisor" />

            <div className="section-space"></div>


        </PageLayout>
    )

}