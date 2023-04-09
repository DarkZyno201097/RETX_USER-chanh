import { Component, createRef, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide, } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';

import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import ProductItem from "@components/box/product_item";


interface IProps {
    products: RealEstateAssetView[]
}

export default function SliderProductItem({
    products
}: IProps) {

    const [currentLoadPrice, setCurrentLoadPrice] = useState(0)

    return (
        <div className="banner-slider" style={{
            position: 'relative'
        }}>

            {/* <button className="swiper-prev-custom swiper-prev-custom-banner" style={{ backgroundColor: '#0000', border: 'none' }}>
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
                spaceBetween={10}
                slidesPerView={2}
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
                        slidesPerView: 3,
                        spaceBetween: 20,
                    },
                }}
            >

                {products.map((item, index) => (
                    <SwiperSlide key={item._id}>
                        <ProductItem
                            asset={item}
                            className=""
                            border
                        />
                    </SwiperSlide>
                ))}

            </Swiper>

        </div>
    )
}