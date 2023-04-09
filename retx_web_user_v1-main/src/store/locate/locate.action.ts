import { AppThunk, dispatch } from '@store/index'
import { sliceActions } from '@store/locate/locate.slice'
import { contactApi, locateApi } from '@apis/index'
import { Locations } from 'src/models/locations.model'
import { Contact } from 'src/models/response/contact.model'


export const getLocations = (): AppThunk => async (dispatch) => {
    try{
        let response: any = await locateApi.getLocations()
        dispatch(sliceActions.getLocations(new Locations(response.data as any)));
    }
    catch(err){
        console.log(err)
    }
}


export  const getContact = (): AppThunk => async (dispatch) => {
    try{
        let response: any = await contactApi.getContact()
        dispatch(sliceActions.getContact(new Contact(response.data)))
    }
    catch(err){
        console.log(err)
    }
}

export const switchLocate = sliceActions.switchLocate