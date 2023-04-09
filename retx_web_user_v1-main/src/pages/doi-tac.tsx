import { useDispatch, useSelector } from "react-redux";
import Clamp from 'react-multiline-clamp';
import { useEffect, useRef, useState } from "react";

import { humanActions } from "@store/actions";
import ModalBase from "@components/modal";
import TitleWidthFull from "@components/text/title_w_full";
import PageLayout from "@layouts/page";
import { humanSelector } from "@store/human/human.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { Human } from "src/models/response/human.model";
import { trans } from "src/resources/trans";



export default function DoiTacPage() {

    const dispatch = useDispatch()

    const { humans } = useSelector(humanSelector)
    const { locate } = useSelector(locateSelector)

    const [newsItemWidthLeft, setNewsItemWidthLeft] = useState(0)
    const [newsItemWidthRight, setNewsItemWidthRight] = useState(0)
    const [change, setChange] = useState(0)

    const [showInfo, setShowInfo] = useState(false)
    const [infoPartner, setInfoPartner] = useState<Human>(new Human())

    const itemRef = useRef<HTMLAnchorElement>()

    useEffect(() => {
        dispatch(humanActions.getHumans('partner'))
    }, [])


    useEffect(() => {
        // check breakpint
        if (itemRef.current) {
            let w = window.innerWidth
            if (w < 576) {
                setNewsItemWidthLeft(itemRef?.current?.offsetWidth * 0.3)
                setNewsItemWidthRight(itemRef?.current?.offsetWidth * 0.6)
            }
            else if (w > 1200) {
                setNewsItemWidthLeft(itemRef?.current?.offsetWidth * 0.4)
                setNewsItemWidthRight(itemRef?.current?.offsetWidth * 0.5)
            }
        }
        else {
            setTimeout(() => {
                setChange(change => change + 1)
            }, 100);
        }

    }, [change])

    return (
        <PageLayout>
            <section className="">
                <TitleWidthFull title={trans[locate].metadap_partner} />

                <ModalBase
                    visible={showInfo}
                    onCancel={() => setShowInfo(false)}
                >
                    <div className="modal-partner">
                        {/* Button close */}
                        <a onClick={() => setShowInfo(false)} role="button" className="a-none btn-modal-close">
                            <i className="fa-regular fa-xmark"></i>
                        </a>

                        {/* Avatar */}
                        <div style={{
                            position: 'relative',
                            width: 200,
                            height: 200 /1.3,
                            overflow: 'hidden'
                        }} className="news--image" >
                            <img style={{ width: 200 }} src={infoPartner.avatarUrl || 'https://via.placeholder.com/240x180'} alt="" />
                        </div>

                        {/* Text */}
                        <h5 className="mt-3" style={{ fontWeight: 'bold' }}>
                            {infoPartner.translates[locate].fullname}
                        </h5>

                        <p style={{ whiteSpace: 'pre-wrap' }}>
                            {infoPartner.translates[locate].description}
                        </p>

                    </div>
                </ModalBase>

                <div className="container pt-3">
                    <div className="row">
                        {humans.partner.map((item, index) => (
                            <div key={item._id} className="col-12 col-lg-6 mb-3 mb-xl-4 " >
                                <a onClick={() => {
                                    setShowInfo(true)
                                    setInfoPartner(item)
                                }} role="button" ref={itemRef} className="news-box p-xl-3 a-none">
                                    <div style={{
                                        position: 'relative',
                                        width: newsItemWidthLeft,
                                        height: newsItemWidthLeft / 1.3
                                    }} className="news--image" >
                                        <img style={{ width: newsItemWidthLeft }} src={item.avatarUrl || 'https://via.placeholder.com/240x180'} alt="" />
                                    </div>
                                    <div className="news-box__content ms-xl-3" style={{
                                        width: newsItemWidthRight,
                                        overflow: 'hidden',
                                        height: newsItemWidthLeft/1.3

                                    }}>
                                        <a onClick={() => {
                                            setShowInfo(true)
                                            setInfoPartner(item)
                                        }} role="button" className="a-none fw-bold fs-5">
                                            {item.translates[locate].fullname}
                                        </a>
                                        <Clamp lines={parseInt((newsItemWidthLeft / 1.3/ 22.62).toFixed(0)) - 3} maxLines={1000} >
                                            <p>{item.translates[locate].description}</p>
                                        </Clamp>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

            </section>

            <section>
                

            </section>
        </PageLayout>
    )
}