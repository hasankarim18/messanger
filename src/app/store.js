import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../features/api/apiSlice';
import authSliceReducer from '../features/auth/authSlice'
import conversationsReducer from '../features/conversations/conversationsSlice'
import messagesReducer from '../features/messages/messagesSlice'

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSliceReducer,
    conversations: conversationsReducer,
    messages: messagesReducer
  },
  middleware: (gdm) => gdm().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production'

});
