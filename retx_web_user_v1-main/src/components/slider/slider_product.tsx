import { Component, createRef, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide, } from 'swiper/react';
import { Navigation, Pagination, Autoplay} from 'swiper';
import { useSelector } from "react-redux";

import { bannerSelector } from "@store/banner/banner.slice";
import Lightbox from '@components/box/lightbox';


interface IProps {
    images: string[]
}

export default function SliderProduct({
    images
}: IProps) {

    const [change, setChange] = useState(0)

    const [heigthImage, setHeigthImage] = useState(0)
    const [indexImageViewer, setIndexImageViewer] = useState(0)
    const [showImageViewer, setShowImageViewer] = useState(false)

    const imageRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (imageRef.current) {
            setHeigthImage(imageRef?.current?.offsetWidth * 3 / 5)
        }
        else {
            setTimeout(() => {
                setChange(change => change + 1)
            }, 100);
        }
    }, [change])

    return (
        <div className="banner-slider" ref={imageRef} style={{
            position: 'relative'
        }}>

            {!!showImageViewer && (
                <Lightbox
                    images={images}
                    startIndex={indexImageViewer}
                    onClose={() => setShowImageViewer(false)}
                />
            )}
            
{/* 
            <button className="swiper-prev-custom swiper-prev-custom-banner" style={{ backgroundColor: '#0000', border: 'none' }}>
                <i className="fa-regular fa-angle-left"></i>
            </button>
            <button className="swiper-next-custom swiper-next-custom-banner" style={{ backgroundColor: '#0000', border: 'none' }}>
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
                // navigation={{
                //     prevEl: `.swiper-prev-custom-banner`,
                //     nextEl: `.swiper-next-custom-banner`,
                //     disabledClass: "disable",
                // }}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false
                }}
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
                    images.length > 0 ? images.map((item, index) => (
                            <SwiperSlide key={item}>
                                <div onClick={()=> {
                                    setIndexImageViewer(index)
                                    setShowImageViewer(true)
                                }} className="banner-slider--image  d-flex justify-content-center align-items-center" >
                                    <img src={item} alt="product image" style={{width: '100%', height: heigthImage}} />
                                </div>
                            </SwiperSlide>
                    )) : (
                        <SwiperSlide>
                            <div className="banner-slider--image d-flex justify-content-center align-items-center">
                            <div className="d-flex justify-content-center align-items-center" style={{width: '100%', height: heigthImage}} >
                                <span style={{
                                    fontSize: 100
                                }}>
                                    <i className="fa-thin fa-image"></i>
                                </span>
                            </div>
                            </div>
                        </SwiperSlide>
                    )
                }
            </Swiper>

        </div>
    )
}