
import axios, { Method } from 'axios';
import cookie from 'react-cookies';


const ErrorResponse = (e: any) => {
    try {
        console.log(e)
        if (e.response?.status == 401 || e.response?.status == 403) {
        }
        return { ...e.response?.data, statusCode: e.response?.status }
    }
    catch (err) {
        console.log(err)
        return err
    }
}

interface IPramsRequest {
    url: string,
    method: Method,
    headers?: any,
    data?: any,
    params?: any,
    endpoint?: string,
}



export async function baseApi<T>({ url, method, headers, data , params, endpoint}: IPramsRequest): Promise<T> {
    return new Promise((resolve, reject) => {
        let lang = localStorage.getItem('locate')
        if (!lang) lang = 'vi'
        return axios({
            url: (endpoint ? endpoint : process.env.ENDPOINT) + url,
            method,
            headers: {
                Authorization: 'Bearer ' + cookie.load('access_token'),
                "Accept-language": lang,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
                ...headers
            },
            params,
            data
        }).then(({ data }: { data: T }) => {
            resolve(data)
        }).catch(e => reject(ErrorResponse(e)))
    })
}
