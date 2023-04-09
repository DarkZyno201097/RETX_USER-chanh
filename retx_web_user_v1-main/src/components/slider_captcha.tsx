import axios from "axios";
import React, { useState } from 'react';
import SliderCaptcha from '@slider-captcha/react';


interface IProps {
    onVerifySuccess: (captchaToken: string) => void;
    warning: boolean;
}


export default function SliderCaptchaBox({
    onVerifySuccess,
    warning
}: IProps) {
    const [requestId, setRequestId] = useState('')

    return (
        <div style={{
            ...warning ? { border: '2px solid red' } : {}
        }}>
            <SliderCaptcha
                create={async () => {
                    const { data } = await axios({
                        baseURL: process.env.ENDPOINT,
                        url: `${process.env.API_PREFIX_IDENTITY}/v1/captcha/create`,
                        method: 'GET',
                    });
                    setRequestId(data.requestId);
                    return data.data;
                }}
                verify={async (response: any, trail: any) => {
                    const { data } = await axios({
                        baseURL: process.env.ENDPOINT,
                        url: `${process.env.API_PREFIX_IDENTITY}/v1/captcha/verify`,
                        method: 'POST',
                        data: {
                            data: { response, trail },
                            requestId,
                        },
                    });
                    return data;
                }}
                callback={(data: any) => {
                    console.log("Verified captcha successfully")
                    onVerifySuccess(data)
                }}
                text={{ anchor: 'Tôi không phải robot', challenge: 'Slide to finish the image' }}
            />
        </div>
    )
}