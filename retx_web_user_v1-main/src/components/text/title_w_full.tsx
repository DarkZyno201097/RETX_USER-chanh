import { CSSProperties } from "react";
import Link from 'next/link'

interface IProps {
    title: string,
    styleContainer?: CSSProperties,
    styleText?: CSSProperties,
    textButton?: string,
    hrefButton?: string
}

export default function TitleWidthFull({
    title, styleContainer, styleText, textButton, hrefButton
}: IProps) {

    return (
        <h3 className="section-title--w-100" style={{ ...styleContainer }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="d-flex align-items-center">
                        <span className="box-1"></span>
                        <span className="box-2"></span>
                        <span className="text" style={{ ...styleText , fontSize: 16}}>
                            {title}
                        </span>
                    </div>

                    {textButton && (
                        <Link legacyBehavior href={hrefButton || "#"} >
                            <a className="a-none fs-6 d-flex section-title--button">
                                <span>{textButton}</span>
                                <span className="ms-2">
                                    <i className="fa-regular fa-angles-right"></i>
                                </span>
                            </a>
                        </Link>
                    )}
                </div>
            </div>
        </h3>
    )
}