import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    accessToken: undefined,
    user: undefined
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        userLoggedIn: (state, action) => {

            state.accessToken = action.payload.accessToken
            state.user = action.payload.user
        },
        userLogeedOut: (state, action) => {
            state.accessToken = undefined
            state.user = undefined
        }
    }
})

export const { userLoggedIn, userLogeedOut } = authSlice.actions

export default authSlice.reducer 