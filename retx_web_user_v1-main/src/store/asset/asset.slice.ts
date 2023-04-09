import Router from 'next/router'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { RootState } from '@store/reducer'
import { routeNames } from '@utils/router'
import { Comments, CommentsUser } from 'src/models/comment.model'
import { RealEstateAssetView } from 'src/models/asset/real_estate.model'
import { IPaginateData } from 'src/models/paginate-data.interface'
import { IFilterAssetOption } from 'src/models/asset/filter_options'
import { Asset } from 'src/models/asset/asset.model'
import { ICart } from 'src/models/cart.model'

export interface AssetState {
    assets: {
        realEstate: RealEstateAssetView[]
    },
    pagination: {
        limit: number,
        page: number,
        total: number
    },
    loadingGetAssets: boolean,
    firstGetAssets: boolean,
    comments: CommentsUser[],
    loadingComments: boolean,
    loadingComment: boolean,
    filterBySeller: string,
    textSearchProduct: string,
    textSearchingProduct: string,
    dataProducts: {
        data: RealEstateAssetView[],
        paginate: {
            limit: number,
            page: number,
            total: number,
        },
        totalResult: number
    },
    loadingDataProducts: boolean,
    filterOptions: IFilterAssetOption,
    cart: ICart[],
    loadingGetCart: boolean
}

export const initialState: AssetState = {
    assets: {
        realEstate: []
    },
    pagination: {
        limit: 0,
        page: 0,
        total: 0
    },
    loadingGetAssets: false,
    firstGetAssets: false,
    comments: [],
    loadingComments: false,
    loadingComment: false,
    filterBySeller: null,
    textSearchProduct: '',
    textSearchingProduct: '',
    dataProducts: {
        data: [],
        paginate: {
            limit: 12,
            page: 1,
            total: 0,
        },
        totalResult: 0
    },
    loadingDataProducts: false,
    filterOptions: {},
    cart: [],
    loadingGetCart: false,
}

export const assetSlice = createSlice({
    name: 'asset',
    initialState,
    reducers: {
        getRealEstateSuccess: (state, { payload }: PayloadAction<{
            type: 'realEstate',
            data: RealEstateAssetView[],
            pagination: {
                limit: number,
                page: number,
                total: number
            }
        }>) => {
            state.assets[payload.type] = payload.data
            state.loadingGetAssets = false
            state.firstGetAssets = true
            state.pagination = payload.pagination
        },
        loadingGetAssets: (state) => {
            state.loadingGetAssets = true
        },

        loadingComments: (state) => {
            state.loadingComments = true
            state.comments = []
        },
        getCommentsSuccess: (state, { payload }: PayloadAction<CommentsUser[]>) => {
            state.loadingComments = false;
            state.comments = payload
        },
        getCommentsFail: (state) => {
            state.loadingComments = false;
            state.comments = []
        },

        loadingComment: (state) => {
            state.loadingComment = true;
        },
        commentSuccess: (state, { payload }: PayloadAction<CommentsUser>) => {
            state.loadingComment = false;
            state.comments.push(payload)
        },
        commentFail: (state) => {
            state.loadingComment = false;
        },
        setFilterBySeller: (state, { payload }: PayloadAction<string>) => {
            state.filterBySeller = payload
        },
        // user click search
        onChangeSearch: (state, { payload }: PayloadAction<string>) => {
            state.textSearchingProduct = payload
            state.textSearchProduct = payload
            // Router.push(routeNames.product)

            let temp_history: string[] = JSON.parse(localStorage.getItem('search_history'))
            if (!temp_history) temp_history = []

            if (temp_history.indexOf(payload) < 0)
                temp_history.push(payload)

            localStorage.setItem('search_history', JSON.stringify(temp_history))
        },
        // user typing in input search
        onSearching: (state, { payload }: PayloadAction<string>) => {
            state.textSearchingProduct = payload.replace(/[^a-zA-Z0-9À-ỹ\s]/g, '')
        },
        loadingGetCart: (state) => {
            state.loadingGetCart = true
        },
        getCartSuccess: (state, {payload}: PayloadAction<ICart[]>) => {
            state.loadingGetCart = false
            state.cart = payload
        },
        getCartFail: (state) => {
            state.loadingGetCart = false;
            state.cart = []
        },
        loadingDataProducts: (state) => {
            state.loadingDataProducts = true
        },
        getDataProductsSuccess: (state, { payload }: PayloadAction<{
            data: IPaginateData<RealEstateAssetView>,
            filterOptions: IFilterAssetOption
        }>) => {
            state.loadingDataProducts = false;
            state.dataProducts = payload.data;
            state.filterOptions = payload.filterOptions
        },
        getDataProductsFail: (state) => {
            state.loadingDataProducts = false;
            state.dataProducts = {
                data: [],
                paginate: {
                    limit: 0,
                    page: 0,
                    total: 0,
                },
                totalResult: 0
            }
        }
    },
})

export const sliceActions = assetSlice.actions
export const assetReducer = assetSlice.reducer
export const assetSelector = (state: RootState) => state.asset