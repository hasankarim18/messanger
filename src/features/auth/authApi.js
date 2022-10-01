import { Result } from "postcss";
import { apiSlice } from "../api/apiSlice";
import { userLoggedIn, userLogeedOut } from "./authSlice";


const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (user) => ({
                url: "/register",
                method: "POST",
                body: user
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    localStorage.setItem('auth', JSON.stringify({
                        accessToken: data.accessToken,
                        user: data.user
                    }))
                    dispatch(userLoggedIn(data))
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        login: builder.mutation({
            query: (data) => ({
                url: "/login",
                method: 'POST',
                body: data
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    localStorage.setItem('auth', JSON.stringify({
                        accessToken: data.accessToken,
                        user: data.user
                    }))
                    dispatch(userLoggedIn(data))
                } catch (error) {
                    console.log(error);
                }
            }
        })
    })
})

export const {
    useRegisterMutation,
    useLoginMutation
} = authApi