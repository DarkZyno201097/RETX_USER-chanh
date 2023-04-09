import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { RootState } from '@store/reducer'
import { Banner } from 'src/models/response/banner.model'

export interface BannerState {
    banners: Banner[]
}

export const initialState: BannerState = {
    banners: []
}

export const bannerSlice = createSlice({
    name: 'banner',
    initialState,
    reducers: {
        getBannersSuccess: (state, {payload}: PayloadAction<Banner[]>) => {
            state.banners = payload
        },
    },
})

export const sliceActions = bannerSlice.actions
export const bannerReducer = bannerSlice.reducer
export const bannerSelector = (state: RootState) => state.banner