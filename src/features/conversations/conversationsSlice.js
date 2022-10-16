import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    conversationId: undefined,
    sender: {},
    receiver: {}
}

const conversationsSlice = createSlice({
    name: "conversations",
    initialState,
    reducers: {

    }
})

export const { } = conversationsSlice.actions

export default conversationsSlice.reducer 