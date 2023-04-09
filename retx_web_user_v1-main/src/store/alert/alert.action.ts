import { AppThunk, dispatch } from '@store/index'
import { sliceActions } from '@store/alert/alert.slice'


export const alertSuccess = sliceActions.alertSuccess
export const alertError =sliceActions.alertError
export const showModalNoti = sliceActions.showModalNoti
export const closeModalNoti = sliceActions.closeModalNoti
export const warningEnableMetamask = sliceActions.warningEnableMetamask
export const reWarnEnableMetamask = sliceActions.reWarningEnableMetamask
export const warningLongTime = sliceActions.warningLongTime
export const errorLongTime = sliceActions.errorLongTime
export const closeAll = sliceActions.closeAll
export const alertWarning = sliceActions.alertWarning
export const addressConnectedNotMatch = (data:{
    isConnected: boolean,
    myAddress: string,
    connectedAddress: string,
    message: string
}): AppThunk => async (dispatch) => {
    if (!!data.isConnected && !!data.connectedAddress && !!data.myAddress && data.connectedAddress != data.myAddress ) 
    dispatch(sliceActions.errorLongTime(data.message))
}