import { configureStore } from "@reduxjs/toolkit";
import authenticationReducer from './authentication/AuthenticationSlice';

export const store : any = configureStore({
    reducer: {
        authentication: authenticationReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;