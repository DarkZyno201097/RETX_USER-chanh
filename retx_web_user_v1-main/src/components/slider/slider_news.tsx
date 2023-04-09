import { Component, createRef, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide, } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { newsActions } from "@store/actions";
import { newsSelector } from "@store/news/news.slice";
import { locateSelector } from "@store/locate/locate.slice";
import Clamp from 'react-multiline-clamp';
import Skeleton from "react-loading-skeleton";



interface IProps {
    type: 'company' | 'market'
}

export default function SliderNews({
    type
}: IProps) {
    const dispatch = useDispatch()
    const { news, loadingGetNews } = useSelector(newsSelector)
    const { locate } = useSelector(locateSelector)


    useEffect(() => {
        dispatch(newsActions.getNews({
            type
        }))
    }, [])

    return (
        <div style={{
            position: 'relative'
        }}>

            {/* <button className={`swiper-prev-custom-${type} swiper-prev-custom`}>
                <i className="fa-regular fa-angle-left"></i>
            </button>
            <button className={`swiper-next-custom-${type} swiper-next-custom`}>
                <i className="fa-regular fa-angle-right"></i>
            </button> */}

            <button role="button" className="swiper-pag" style={{
                border: 'none',
                backgroundColor: "#fff"
            }}>
            </button>

            <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={2}
                loop={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false
                }}
                // navigation={{
                //     prevEl: `.swiper-prev-custom-${type}`,
                //     nextEl: `.swiper-next-custom-${type}`,
                //     disabledClass: "disable",
                // }}
                pagination={true}
                breakpoints={{
                    1200: {
                        slidesPerView: 4,
                        spaceBetween: 30,
                    },
                }}
            >
                {!loadingGetNews[type] && news[type].map((item, index) => {
                    return (
                        <SwiperSlide key={item?._id || index} >
                            <a href={item.url} target={'_blank'} className='a-none news-item gap-2'>
                                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 5, overflow: 'hidden' }}>
                                    <Image src={item.imageUrl} fill alt="" />
                                </div>
                                <h6 className='time'>
                                    02/02/2022
                                </h6>
                                <h6 className='title'>
                                    <Clamp lines={2} maxLines={2}>
                                    {item.translates[locate].title}
                                    </Clamp>
                                </h6>
                                <p className='description'>
                                <Clamp lines={2} maxLines={2}>
                                    {item.translates[locate].description}
                                    </Clamp>
                                </p>
                            </a>
                        </SwiperSlide>
                    )
                })}


                {loadingGetNews[type] &&  "1234".split("").map((item) => (
                    <SwiperSlide key={item}>
                        <Skeleton style={{
                            width: '100%',
                            height: 300,
                            marginBottom: 20
                        }} />
                    </SwiperSlide>
                ))}

            </Swiper>
        </div>
    )

}