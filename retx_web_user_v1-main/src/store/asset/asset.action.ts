import { AppThunk, dispatch } from '@store/index'
import { sliceActions } from '@store/asset/asset.slice'
import { assetApi, userApi } from '@apis/index'
import { IFilterAssetOption } from 'src/models/asset/filter_options'


export const getDataProducts = ({
    limit, page, filterObj, search
}:{
    limit?: number,
    page?: number,
    filterObj?: IFilterAssetOption,
    search?: string
}): AppThunk => async (dispatch, getState) => {
    console.log("🚀 ~ file: asset.action.ts:15 ~ filterObj", filterObj)
    try {
        dispatch(sliceActions.loadingDataProducts())
        let searchProduct = getState().asset.textSearchProduct
        let paginate = getState().asset.dataProducts.paginate
        let filterOptions = getState().asset.filterOptions

        let data = await assetApi.getAssets({
            page,
            limit: limit || paginate.limit,
            filterObj: filterObj || filterOptions,
            search: search
        })
        dispatch(sliceActions.getDataProductsSuccess({
            data,
            filterOptions: filterObj || {}
        }))
    }
    catch (err) {
        console.log(err)
        dispatch(sliceActions.getDataProductsFail())
    }
}

export const comment = (data: {
    assetId: string,
    content: string,
    ratting: string
}, onSuccess: ()=>void): AppThunk => async (dispatch) => {
    try{
        dispatch(sliceActions.loadingComment())
        let {message, comment} = await assetApi.commentProduct(data)
        dispatch(sliceActions.commentSuccess(comment))
        onSuccess();
    }
    catch(e){
        dispatch(sliceActions.commentFail())
        console.log(e)
    }
}


export const getCommentsBy = (id: string): AppThunk => async (dispatch) => {
    try{
        dispatch(sliceActions.loadingComments())
        let  data = await assetApi.getCommentsBy(id)
        dispatch(sliceActions.getCommentsSuccess(data))
    }
    catch(e){
        console.log(e)
        dispatch(sliceActions.getCommentsFail())
    }
}

export const setFilterBySeller = sliceActions.setFilterBySeller
export const self = sliceActions

export const loadCart = (): AppThunk => async (dispatch) => {
    try{
        dispatch(self.loadingGetCart())
        let assets = await userApi.cartList('all')
        dispatch(self.getCartSuccess(assets))
    }
    catch(e){
        dispatch(self.getCartFail())
        console.log(e)
    }
}