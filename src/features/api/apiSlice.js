import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { userLogeedOut } from '../auth/authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:9000',
    // baseUrl: 'https://messenger18.herokuapp.com/messenger',
    prepareHeaders: async (headers, { getState, endpoint }) => {
        const token = getState()?.auth.accessToken
        if (token) {
            headers.set("Authorization", `Bearer ${token}`)

        }
        return headers
    }

})

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: async (args, api, extraOptions) => {
        let result = await baseQuery(args, api, extraOptions)

        if (result.error && result.error.status === 401) {
            api.dispatch(userLogeedOut())
            localStorage.clear()
        }

        //   console.log(result)

        return result
    },
    tagTypes: [],
    endpoints: () => ({})
})

// create api
