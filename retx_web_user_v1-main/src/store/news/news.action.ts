import { AppThunk, dispatch } from '@store/index'
import { sliceActions } from '@store/news/news.slice'
import { IGetNews } from 'src/models/response/news.model'
import { newsApi } from '@apis/index'


export const getNews = (data: IGetNews): AppThunk => async (dispatch) => {
    try {
        dispatch(sliceActions.loadingGetNews(data.type))
        let response: any = await newsApi.getNews(data)
        dispatch(sliceActions.getNewsSuccess({
            type: data.type,
            data: response.data as any[]
        }))
    }
    catch (err) {
        console.log(err)
    }
}