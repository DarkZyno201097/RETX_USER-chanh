import { AppProps } from 'next/app';
import Alert from 'react-s-alert';
import Head from 'next/head';
import { Provider, useDispatch } from 'react-redux';
import { MetaMaskProvider } from "metamask-react";

import store from '@store/index';

import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';
import 'react-s-alert/dist/s-alert-css-effects/scale.css';

import 'antd/dist/antd.css';
import '../resources/font-awesome6pro/css/all.min.css'
import '../resources/css/theme.scss'
import '../resources/css/theme2.scss'
import '../resources/css/main.scss'
import 'swiper/css';
import 'swiper/css/bundle'
import 'react-loading-skeleton/dist/skeleton.css'
import "../resources/css/lightbox.css";
import 'react-phone-input-2/lib/style.css'
import { ConfigProvider } from 'antd';
import Empty from '@components/text/empty';


function App({ Component, pageProps }: AppProps) {

  console.log("TIME UPDATED: 6/04/2023")

  return (
    <>
      <Head>

        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content={"MetaDAP có sứ mệnh #tiên phong để xây dựng một nền tảng số hóa Tài sản và hỗ trợ đa kết nối để mở ra cánh cửa phục vụ cho nền Kinh tế số."} />
        <meta name="author" content={"RETX"} />
        <title>RETX</title>

        <link  rel="icon" type="image/svg+xml" href="/img/favicon.svg" />
        <link  rel="shortcut icon" href="/img/favicon.ico" type="image/x-icon"/>
        <meta property='og:image' content='/img/favicon.svg' />

        <link  href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossOrigin="anonymous" />

      </Head>

      <Alert stack={{ limit: 3 }} />
      <MetaMaskProvider>

        <Provider store={store}>
          <ConfigProvider renderEmpty={() => (<Empty />)} >
            <Component {...pageProps} />
          </ConfigProvider>
        </Provider>
      </MetaMaskProvider>
    </>
  )
}

export default App
