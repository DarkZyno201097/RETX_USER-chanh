import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@store/reducer'
import { News } from 'src/models/response/news.model'

export interface NewsState {
    loadingGetNews: {
        market: boolean,
        company: boolean
    };
    news: {
        market: News[],
        company: News[]
    }

}

export const initialState: NewsState = {
    loadingGetNews: {
        market: false,
        company: false
    },
    news: {
        market: [],
        company: [],
    }
}

export const newsSlice = createSlice({
    name: 'news',
    initialState,
    reducers: {
        loadingGetNews: (state, {payload}: PayloadAction<'market' | 'company'>) => {
            state.loadingGetNews[payload] = true
        },
        getNewsSuccess: (state, {payload}: PayloadAction<{type: 'market' | 'company', data: News[]}>)=>{
            state.loadingGetNews[payload.type] = false;
            state.news[payload.type] = [...payload.data]
        }
    },
})

export const sliceActions = newsSlice.actions
export const newsReducer = newsSlice.reducer
export const newsSelector = (state: RootState) => state.news