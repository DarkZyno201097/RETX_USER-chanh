import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/router';
import Clamp from 'react-multiline-clamp';
import Image from 'next/image'

import { newsActions } from "@store/actions";
import TitleWidthFull from "@components/text/title_w_full";
import { newsSelector } from "@store/news/news.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { trans } from "src/resources/trans";
import { routeNames } from "@utils/router";



interface IProps {
    type: 'market' | 'company',
    title: string,
    onButton?: () => void,
    limit?: number,
    hideButton?: boolean,
    hiddenViewAll?: boolean,
}

export default function NewsContainer({ type, title, onButton, limit, hideButton, hiddenViewAll }: IProps) {
    const dispatch = useDispatch()
    const { locale } = useRouter()

    const { news } = useSelector(newsSelector)
    const { locate } = useSelector(locateSelector)

    const [newsItemWidthLeft, setNewsItemWidthLeft] = useState(0)
    const [newsItemWidthRight, setNewsItemWidthRight] = useState(0)
    const [change, setChange] = useState(0)

    const itemRef = useRef<HTMLAnchorElement>()

    useEffect(() => {
        dispatch(newsActions.getNews({
            type
        }))
    }, [])

    useEffect(() => {
        // check breakpint
        if (itemRef.current) {
            let w = window.innerWidth
            // console.log(w)
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
        <section className="">
            {hiddenViewAll?(
                 <TitleWidthFull title={title} />
            ):(
                <TitleWidthFull title={title} textButton={trans[locate].view_all} hrefButton={routeNames.news+"/" + type} />
            )}
            <div style={{ marginTop: '3rem' }}></div>
            <div className="container">
                <div className="row">
                    {news[type].slice(0, limit).map((value, index) => (
                        <div key={value._id} className="col-12 col-lg-6 mb-4 ">
                            <a href={value.url} target="_blank" ref={itemRef} className="news-box a-none">
                                <div style={{
                                    position: 'relative',
                                    width: newsItemWidthLeft,
                                    height: newsItemWidthLeft * 3 / 4
                                }} className="news--image" >
                                    <img src={value.imageUrl || 'https://via.placeholder.com/240x180'} alt="" />
                                </div>
                                <div className="news-box__content " style={{
                                    width: newsItemWidthRight
                                }}>
                                    <a href={value.url} target="_blank" className="a-none mb-1">
                                        {value.translates[locate].title}
                                    </a>

                                    <div className="h-100">
                                    <Clamp lines={parseInt((newsItemWidthLeft * 2 / 3 / 22.62).toFixed(0)) - 3 || 2} maxLines={1000} >
                                        <p>{value.translates[locate].description}</p>
                                    </Clamp>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-4"></div>
        </section>
    )

}