import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/mesagesApi";
import io from 'socket.io-client'


export const conversationsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: (email) => `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
            transformResponse(apiResponse, meta) {
                const totalCount = meta.response.headers.get('X-Total-Count')
                //   console.log('totalCount:::', totalCount)
                return {
                    data: apiResponse,
                    totalCount
                }
            },
            // onChacheEntryAdded
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
                    socket.on("conversations", (data) => {
                        // the data we provide to the server and return from server by eimitting
                        // console.log(data)
                        updateCachedData(draft => {
                            const conversation = draft.data.find(c => c.id == data.data.id);

                            if (conversation?.id) {
                                // update conversation   
                                conversation.message = data.data.message
                                conversation.timestamp = data.data.timestamp
                            } else {
                                // do nothing or add conversation
                            }
                        })
                    })
                } catch (error) {
                    await cacheEntryRemoved;
                    socket.close()
                }

            }
        }),
        getMoreConversations: builder.query({
            query: ({ email, page }) => `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=${page}&_limit=5`,
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                //  console.log('edit conversation')
                try {
                    const conversations = await queryFulfilled
                    if (conversations?.data?.length > 0) {

                        // pesimistic update conversation cache start 
                        dispatch(
                            apiSlice.util.updateQueryData(
                                'getConversations',
                                arg.email,
                                (draft) => {
                                    //  console.log(JSON.stringify(draft))
                                    return {
                                        data: [...draft.data, ...conversations.data],
                                        totalCount: Number(draft.totalCount)
                                    }
                                })
                        )
                        // pesimistic update messages cache end
                    }
                } catch (err) {
                    console.log(err)
                    //  patchResult1.undo()
                }

            } // async function

        }),
        getConversation: builder.query({
            query: ({ userEmail, participantEmail }) => `/conversations?participants_like=${userEmail}-${participantEmail}&&participants_like=${participantEmail}-${userEmail}`
        }),
        addConversation: builder.mutation({
            query: ({ sender, data }) => ({
                url: '/conversations',
                method: "POST",
                body: data
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {

                //  optimistic add conversation  start 
                const addResult1 = dispatch(
                    apiSlice.util.updateQueryData('getConversations', arg.sender, (draft) => {
                        const newConversation = draft
                        return newConversation.concat(arg.data)
                    })
                )
                // optimistic add conversation end 
                try {
                    const conversation = await queryFulfilled
                    if (conversation?.data.id) {
                        // silent entry to message table
                        const users = arg.data.users
                        // const sender = arg.sender
                        const senderUser = users.find(user => user.email === arg.sender)
                        const receiverUser = users.find(user => user.email !== arg.sender)
                        // dispatching message 
                        dispatch(messagesApi.endpoints.addMessage.initiate({
                            conversationId: conversation.data.id,
                            sender: senderUser,
                            receiver: receiverUser,
                            message: arg.data.message,
                            timestamp: arg.data.timestamp
                        }))
                    }
                } catch (error) {
                    // console.log(error)
                    addResult1.undo()
                }
            }
        }),
        editConversation: builder.mutation({
            query: ({ sender, id, data }) => ({
                url: `conversations/${id}`,
                method: "PATCH",
                body: data
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                //  console.log('edit conversation')
                try {
                    const conversation = await queryFulfilled
                    if (conversation?.data.id) {
                        // silent entry to message table
                        const users = arg.data.users
                        // const sender = arg.sender
                        const senderUser = users.find(user => user.email === arg.sender)
                        const receiverUser = users.find(user => user.email !== arg.sender)
                        // updating message
                        const res = await dispatch(messagesApi.endpoints.addMessage.initiate({
                            conversationId: conversation.data.id,
                            sender: senderUser,
                            receiver: receiverUser,
                            message: arg.data.message,
                            timestamp: arg.data.timestamp
                        })).unwrap()
                        //  console.log(res)
                        // pesimistic update messages cache start 
                        dispatch(
                            apiSlice.util.updateQueryData(
                                'getMessages',
                                res.conversationId.toString(),
                                (draft) => {
                                    draft.push(res)
                                })
                        )

                        // pesimistic update messages cache end
                    }
                } catch (err) {
                    console.log(err)
                    //  patchResult1.undo()
                }

            } // async function
        }),
        deleteConversation: builder.mutation({
            query: (id) => ({
                url: `conversations/${id}`,
                method: "DELETE"
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const deleteConversation = await queryFulfilled
                    // console.log('delete conversation::', deleteConversation)
                    //    console.log(deleteConversation.meta.response.status)                   

                    dispatch(
                        apiSlice.util.updateQueryData('getConversations', arg.id, (draft) => {
                            //  console.log(draft)
                            console.log('delete success dispatch')
                        })
                    )

                } catch (error) {
                    console.log('delete failed')
                    console.log(error)
                    // deleteResult1.undo()
                }
            }
        })
    })
})

export const {
    useGetConversationsQuery,
    useGetConversationQuery,
    useAddConversationMutation,
    useEditConversationMutation,
    useDeleteConversationMutation
} = conversationsApi

