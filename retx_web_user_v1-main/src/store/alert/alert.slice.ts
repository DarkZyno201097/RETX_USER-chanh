import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@store/reducer'
import Alert from 'react-s-alert';
import { IModalNoti } from 'src/models/modal.model';


export interface AlertState {
    modalNoti: IModalNoti,
    warningEnableMetamask: boolean,
}

export const initialState: AlertState = {
    modalNoti: {
        visible: false,
        message: ''
    },
    warningEnableMetamask: false,
}

export const alertSlice = createSlice({
    name: 'alert',
    initialState,
    reducers: {
        alertSuccess: (state, {payload}: PayloadAction<string>) => {
            Alert.success(payload, {
                position: 'top-right',
                effect: 'scale',
                timeout: 3000,
            });
        },
        alertError: (state, {payload}: PayloadAction<string>) => {
            Alert.error(payload, {
                position: 'top-right',
                effect: 'scale',
                timeout: 3000,
            });
        },

        alertWarning: (state, {payload}: PayloadAction<string>) => {
            Alert.error(payload, {
                position: 'top-right',
                effect: 'scale',
                timeout: 3000,
            });
        },
        
        showModalNoti: (state, {payload}: PayloadAction<string>) => {
            state.modalNoti = {
                visible: true,
                message: payload
            }
        },
        closeModalNoti: (state) => {
            state.modalNoti = {
                visible: false,
                message: ''
            }
        },

        warningEnableMetamask: (state, {payload}: PayloadAction<string>) => {
            if (state.warningEnableMetamask == false)
            Alert.warning(payload, {
                position: 'top-right',
                effect: 'scale',
                timeout: 9999000,
            });
            state.warningEnableMetamask = true
        },

        reWarningEnableMetamask: (state, {payload}: PayloadAction<string>) => {
            Alert.warning(payload, {
                position: 'top-right',
                effect: 'scale',
                timeout: 9000,
            });
        },

        warningLongTime: (state, {payload}: PayloadAction<string>)=>{
            Alert.warning(payload, {
                position: 'top-right',
                effect: 'scale',
                timeout: 9000,
            });
        },

        errorLongTime:(state, {payload}: PayloadAction<string>)=>{
            Alert.error(payload, {
                position: 'top-right',
                effect: 'scale',
                timeout: 9000,
            });
        },

        closeAll: (state, {payload}: PayloadAction<string>)=>{
            Alert.closeAll()
        }
    },
})

export const sliceActions = alertSlice.actions
export const alertReducer = alertSlice.reducer
export const alertSelector = (state: RootState) => state.alert