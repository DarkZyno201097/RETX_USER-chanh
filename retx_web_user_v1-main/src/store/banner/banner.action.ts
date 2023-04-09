import { AppThunk, dispatch } from '@store/index'
import { sliceActions } from '@store/banner/banner.slice'
import { bannerApi } from '@apis/index'
import { Banner } from 'src/models/response/banner.model'


export const getBanners = (): AppThunk => async (dispatch) => {
    try{
        let response: any = await bannerApi.getBanners() 
        let data = response.data as Banner[]
        dispatch(sliceActions.getBannersSuccess(data?.map(item => new Banner(item))))
    }
    catch(err){
        console.log(err)

    }
}

