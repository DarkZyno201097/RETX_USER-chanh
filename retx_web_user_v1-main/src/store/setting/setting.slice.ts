import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@store/reducer'

export type TProfileTab  = 'information' | 'single_asset' | 'deposit_withdraw' | 'history_transaction_VND' | 'cart' | 'change_password' | 'my_rating' | 'collection_asset'

export interface SettingState {
    profileTab: TProfileTab
}

export const initialState: SettingState = {
    profileTab: 'information'
}

export const settingSlice = createSlice({
    name: 'setting',
    initialState,
    reducers: {
        switchProfieTab: (state, {payload}: PayloadAction<TProfileTab>) => {
            state.profileTab = payload
        },
    },
})

export const sliceActions = settingSlice.actions
export const settingReducer = settingSlice.reducer
export const settingSelector = (state: RootState) => state.setting