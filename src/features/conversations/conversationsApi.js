import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/mesagesApi";


export const conversationsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: (email) => `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`
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
                // optimistic cache update start 
                const patchResult1 = dispatch(
                    apiSlice.util.updateQueryData('getConversations', arg.sender, (draft) => {
                        //  console.log(draft)
                        const draftConversation = draft.find(c => c.id == arg.id)
                        draftConversation.message = arg.data.message
                        draftConversation.timestamp = arg.data.timestamp
                    })
                )
                // opitimistic cache update end
                try {
                    const conversation = await queryFulfilled
                    if (conversation?.data.id) {
                        // silent entry to message table
                        const users = arg.data.users
                        // const sender = arg.sender
                        const senderUser = users.find(user => user.email === arg.sender)
                        const receiverUser = users.find(user => user.email !== arg.sender)

                        dispatch(messagesApi.endpoints.addMessage.initiate({
                            conversationId: conversation.data.id,
                            sender: senderUser,
                            receiver: receiverUser,
                            message: arg.data.message,
                            timestamp: arg.data.timestamp
                        }))
                    }
                } catch (err) {
                    console.log(err)
                    patchResult1.undo()
                }

            } // async function
        }),
        deleteConversation: builder.mutation({
            query: (id) => ({
                url: `conversations/${id}`,
                method: "DELETE"
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {

                // optimistic delete conversation start 
                const deleteResult1 = dispatch(
                    apiSlice.util.updateQueryData('getConversations', arg.id, (draft) => {
                        //  console.log(draft)
                        console.log('delete dranft')
                    })
                )
                // optimisti delete conversation end

                try {
                    const deleteConversation = await queryFulfilled
                    // console.log('delete conversation::', deleteConversation)
                    console.log('delete success')
                } catch (error) {
                    console.log('delete failed')
                    console.log(error)
                    deleteResult1.undo()
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