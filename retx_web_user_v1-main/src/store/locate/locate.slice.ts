import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { RootState } from '@store/reducer'
import { Locations } from 'src/models/locations.model'
import { Contact } from 'src/models/response/contact.model'

export interface LocateState {
    locate: 'vi' | 'en',
    locations: Locations,
    contact: Contact
}

export const initialState: LocateState = {
    locate: 'vi',
    locations: new Locations(),
    contact: new Contact()
}

export const locateSlice = createSlice({
    name: 'locate',
    initialState,
    reducers: {
        getLocations: (state, {payload}: PayloadAction<Locations>) => {
           state.locations = new Locations(payload) 
        },

        getContact: (state, {payload}: PayloadAction<Contact>) =>{
            state.contact = payload
        },

        switchLocate: (state, {payload}: PayloadAction<'vi'|'en'>) =>{
            state.locate = payload
            localStorage.setItem('locate', payload)
        }
    },
})

export const sliceActions = locateSlice.actions
export const locateReducer = locateSlice.reducer
export const locateSelector = (state: RootState) => state.locate