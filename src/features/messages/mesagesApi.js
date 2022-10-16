import { isFulfilled } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";


export const messagesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: (id) => `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`
        }),
        addMessage: builder.mutation({
            query: (data) => ({
                url: '/messages',
                method: "POST",
                body: data
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {

                try {
                    const addedMessage = await queryFulfilled
                } catch (error) {

                }
            }
        }),
    })
})

export const {
    useGetMessagesQuery,
    useAddMessageMutation
} = messagesApi