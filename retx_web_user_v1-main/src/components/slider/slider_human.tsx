import { Component, createRef, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide, } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';
import { useSelector } from "react-redux";

import { Human } from "src/models/response/human.model";
import { humanSelector } from "@store/human/human.slice";
import FlipBox from "@components/box/flip_box";
import { locateSelector } from "@store/locate/locate.slice";
import { trans } from "src/resources/trans";


interface IProps {
    type: 'team' | 'partner' | 'advisor'
}

export default function SliderHuman({
    type
}: IProps) {

    const { humans } = useSelector(humanSelector)
    const { locate } = useSelector(locateSelector)

    const [data, setData] = useState<Human[]>([])
    const [change, setChange] = useState(0)

    const [heigthImage, setHeigthImage] = useState(0)
    const [heightTitle, setHeightTitle] = useState(0)

    const imageRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (imageRef.current) {
            setHeigthImage(imageRef?.current?.offsetWidth * 1.3 / 1)
        }
        else {
            setTimeout(() => {
                setChange(change => change + 1)
            }, 100);
        }
    }, [change])

    useEffect(() => {
        if (titleRef.current) {
            setHeightTitle(titleRef?.current?.offsetHeight)
        }
        else {
            setTimeout(() => {
                setChange(change => change + 1)
            }, 100);
        }
    }, [change])

    useEffect(() => {
        setData(humans[type])
    }, [humans[type]])

    if (data.length > 0)
        return (
            <div style={{
                position: 'relative'
            }}>
{/* 
                {type != 'partner' && (
                    <>
                        <button className={`swiper-prev-custom-${type} swiper-prev-custom`}>
                            <i className="fa-regular fa-angle-left"></i>
                        </button>
                        <button className={`swiper-next-custom-${type} swiper-next-custom`}>
                            <i className="fa-regular fa-angle-right"></i>
                        </button>
                    </>
                )} */}

                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={1}
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
                            slidesPerView: type == 'partner' ? 5 : 4,
                            spaceBetween: 30,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 30,
                        },
                    }}
                >
                    {type != 'partner' && data.map((item, index) => {
                        // console.log(item._id)
                        return (
                            <SwiperSlide key={item._id + index}>
                                <FlipBox
                                    width='100%'
                                    height={(heigthImage + heightTitle * (item.type == 'advisor' ? 1 : 2) + 21) + "px"}
                                    frontComponent={(
                                        <>
                                            <div
                                                ref={imageRef}
                                                style={{
                                                    height: heigthImage,
                                                    width: '100%',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <img src={item.avatarUrl || "https://via.placeholder.com/90x150"} style={{ width: '100%' }} />
                                            </div>

                                            <div ref={titleRef} className={`human--name text-center`}>
                                                {item.translates[locate].fullname}
                                            </div>
                                            {item.translates[locate].title && (
                                                <div className={`human--name text-center ${item.type == 'advisor' && 'd-none'}`}>
                                                    {item.translates[locate].title}
                                                </div>
                                            )}

                                        </>
                                    )}
                                    backComponent={(
                                        <div className="p-3" style={{ whiteSpace: 'pre-wrap' }} >
                                            <p style={{ color: '#111' }} >{item.translates[locate].description || trans[locate].updating + "..."}</p>
                                        </div>
                                    )}
                                />


                            </SwiperSlide>
                        )

                    })}

                    {type == 'partner' && data.map((item, index) => (
                        <SwiperSlide key={item._id + index} >
                            <div className="slide-human d-flex justify-content-center align-items-center"
                                ref={imageRef}
                                style={{
                                    height: heigthImage * 3 / 5,
                                    width: '100%',
                                }}
                            >
                                <img src={item.avatarUrl || "https://via.placeholder.com/90x150"} style={{ width: '100%' }} />
                            </div>
                        </SwiperSlide>
                    ))}


                </Swiper>

            </div>
        )
    else return (
        <>
            <h5 className="text-center" style={{ color: '#848484' }} >{trans[locate].updating}...</h5>
        </>
    )
}