import { isFulfilled } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import io from 'socket.io-client'


export const messagesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: ({ loggegInuser, id }) => `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                // create socket 
                const socket = io('http://localhost:9000', {
                    reconnectionDelay: 1000,
                    reconnection: true,
                    reconnectionAttempts: 10,
                    transports: ["websocket"],
                    agent: false,
                    upgrade: false,
                    rejectUnauthorized: false
                })

                try {
                    await cacheDataLoaded;
                    socket.on("messages", (data) => {

                        updateCachedData(draft => {

                            const message = draft.find(m => m.conversationId == data.data.conversationId);
                            console.log('logged in user', arg.loggegInuser.email)
                            console.log('sender', data.data.sender.email)
                            console.log('receiver', data.data.receiver.email)
                            console.log(data)

                            if (message?.id) {
                                // update conversation   
                                data.data.id = data.data.id + Math.random()
                                // data.id = Math.random()
                                draft.push(data.data)
                            } else {
                                // add newconversation 

                            }
                        })
                    })
                } catch (error) {
                    await cacheEntryRemoved;
                    socket.close()
                }

            }
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