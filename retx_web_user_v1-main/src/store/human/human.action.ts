import { AppThunk, dispatch } from '@store/index'
import { sliceActions } from '@store/human/human.slice'
import { humanApi } from '@apis/index'


export const getHumans = (type: 'team'|'partner'|'advisor'): AppThunk => async (dispatch) => {
    try{
        dispatch(sliceActions.loadingGetHuman())
        let {data} = await humanApi.getHumans(type)
        dispatch(sliceActions.getHumansSuccess({
            type, data
        }))

    }
    catch(err){
        console.log(err)
    }
}