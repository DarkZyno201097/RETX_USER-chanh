import { Component, createRef, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Swiper, SwiperSlide, } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';

import { bannerSelector } from "@store/banner/banner.slice";


interface IProps {

}

export default function SliderBanner({

}: IProps) {

    const { banners } = useSelector(bannerSelector)
    const [data, setData] = useState([])
    const [change, setChange] = useState(0)

    const [heigthImage, setHeigthImage] = useState(0)

    const imageRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (imageRef.current) {
            console.log(imageRef?.current?.offsetWidth)
            setHeigthImage(imageRef?.current?.offsetWidth * 384 / 853)
        }
        else {
            setTimeout(() => {
                setChange(change => change + 1)
            }, 100);
        }
    }, [change])

    return (
        <div className="banner-slider" style={{
            position: 'relative',
            borderRadius: 10,
            overflow: 'hidden'
        }}>

            {/* <button className="swiper-prev-custom swiper-prev-custom-banner d-none d-xl-block" style={{ backgroundColor: '#0000', border: 'none' }}>
                <i className="fa-regular fa-angle-left"></i>
            </button>
            <button className="swiper-next-custom swiper-next-custom-banner d-none d-xl-block" style={{ backgroundColor: '#0000', border: 'none' }}>
                <i className="fa-regular fa-angle-right"></i>
            </button> */}

            <button role="button" className="swiper-pag" style={{
                border: 'none',
                backgroundColor: "#fff"
            }}>
            </button>

            <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false
                }}
                // navigation={{
                //     prevEl: `.swiper-prev-custom-banner`,
                //     nextEl: `.swiper-next-custom-banner`,
                //     disabledClass: "disable",
                // }}
                pagination={{
                    clickable: true,
                    el: `.swiper-pag`,
                }}
              
                breakpoints={{
                    1200: {
                        slidesPerView: 1,
                        spaceBetween: 30,
                    },
                }}
            >
                {
                    banners.length > 0 ? banners.map(item => (
                            <SwiperSlide key={item._id}>
                                <div className="banner-slider--image" >
                                    <img src={item.imageUrl} style={{width: '100%', aspectRatio: '853/384'}} alt="image banner" />
                                </div>
                            </SwiperSlide>
                    )) : (
                        <SwiperSlide key="1">
                            <div className="banner-slider--image">
                                <img src="/img/banner.png" style={{width: '100%',}} alt="image banner" />
                            </div>
                        </SwiperSlide>
                    )
                }

            </Swiper>

        </div>
    )
}