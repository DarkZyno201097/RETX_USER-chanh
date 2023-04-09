import { combineReducers } from '@reduxjs/toolkit'

/* PLOP_INJECT_IMPORT */
import { transactionReducer } from './transaction/transaction.slice';
import { settingReducer } from './setting/setting.slice';
import { contractReducer } from './contract/contract.slice';
import { authReducer } from './auth/auth.slice';
import { bannerReducer } from './banner/banner.slice';
import { assetReducer } from './asset/asset.slice';
import { locateReducer } from './locate/locate.slice';
import { newsReducer } from './news/news.slice';
import { humanReducer } from './human/human.slice';
import {alertReducer} from './alert/alert.slice'


const rootReducer = combineReducers({
    /* PLOP_INJECT_USE */
	transaction: transactionReducer,
	setting: settingReducer,
	contract: contractReducer,
	auth: authReducer,
	banner: bannerReducer,
	asset: assetReducer,
	locate: locateReducer,
	news: newsReducer,
	human: humanReducer,
    alert: alertReducer
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer