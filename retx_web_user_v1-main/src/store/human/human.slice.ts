import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { RootState } from '@store/reducer'
import { Human } from 'src/models/response/human.model'

export interface HumanState {
    humans: {
        team: Human[],
        partner: Human[],
        advisor: Human[]
    };
    loadingGetHuman: boolean;
}

export const initialState: HumanState = {
    humans: {
        team: [],
        partner: [],
        advisor: []
    },
    loadingGetHuman: false
}

export const humanSlice = createSlice({
    name: 'human',
    initialState,
    reducers: {
        loadingGetHuman: (state)=>{
            state.loadingGetHuman = true
        },
        getHumansSuccess: (state, {payload}: PayloadAction<{type: 'team' | 'partner' | 'advisor', data: Human[]}>) => {
            state.humans = {
                ...state.humans,
                [payload.type]: payload.data
            }
            state.loadingGetHuman = false
        },
    },
})

export const sliceActions = humanSlice.actions
export const humanReducer = humanSlice.reducer
export const humanSelector = (state: RootState) => state.human