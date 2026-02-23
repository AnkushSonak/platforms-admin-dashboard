import { CookieUtils } from '@/lib/utils/CookieUtils/CookieUtils';
import { IUser } from "@/app/helper/interfaces/IUser";
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL; 

interface AuthenticationState {
    loading: boolean;
    user: IUser | null;
    error: any;
    sessionChecked?: boolean;
};

const initialState: AuthenticationState = {
    loading: false,
    user: null,
    error: null,
    sessionChecked: false,
}

export const loginUserAsync = createAsyncThunk(
    'authentication/loginUser',
    async (credentials: { email: string; password: string }) => {
        console.debug('backendBaseUrl : ', backendBaseUrl);
        console.debug('app/state/authentication/authenticationSlice.ts : loginUserAsync() : Logging in user with credentials:', credentials);
        try {
            const response = await fetch(backendBaseUrl + '/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            console.debug('app/state/authentication/authenticationSlice.ts : loginUserAsync() : Login response:', response);

            if (response.status === 403) {
                const errorResponse = await response.json();
                console.error('Login failed with status:', response);
                throw new Error(errorResponse.message || 'login failed, Unauthorized access.');
            }
            return await response.json();
        } catch (error) {
            console.error('app/state/authentication/authenticationSlice.ts : loginUserAsync() : Error occurred:', error);
            return Promise.reject(error);
        }
    }
);

export const restoreSessionAsync = createAsyncThunk(
    'authentication/restoreSession',
    async () => {
        const token = CookieUtils.getCookie('tokenid');
        console.debug('app/state/authentication/authenticationSlice.ts : restoreSessionAsync() : Restoring user session token : ', token);
        try {
            const response = await fetch(backendBaseUrl + `/auth/restoresession/${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.debug('app/state/authentication/authenticationSlice.ts : restoreSessionAsync() : Restore session response:', response);
            if (response.status === 403) {
                const errorResponse = await response.json();
                console.error('Login failed with status:', response);
                throw new Error(errorResponse.message || 'login failed, Unauthorized access.');
            }
            return await response.json();
        } catch (error) {
            console.error('app/state/authentication/authenticationSlice.ts : restoresessionAsync() : Error occurred:', error);
            return Promise.reject(error);
        }
    }
);

export const fetchCurrentUserAsync = createAsyncThunk(
    'authentication/fetchCurrentUser',
    async (userId: string) => {
        console.debug('app/state/authentication/authenticationSlice.ts : fetchCurrentUserAsync() : Fetching current user with ID:', userId);
        try {
            const response = await fetch(`/users/${userId}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "contentType": "application/json"
                }
            });
            console.debug('app/state/authentication/authenticationSlice.ts : fetchCurrentUserAsync() : response : ', response);
            return await response.json();
        }catch (error) {
            console.error('app/state/authentication/authenticationSlice.ts : fetchCurrentUserAsync() : Error occurred:', error);
            return Promise.reject(error);
        }

    }
);

const authenticationSlice = createSlice({
    name: "authentication",
    initialState,
    extraReducers: (builder) => {
        builder.addCase(loginUserAsync.pending, (state) => {
            console.log("app/state/authentication/authenticationSlice.ts : loginUserAsync.pending : state = ", state);
            state.loading = true;
            state.error = null;
            // state.user = null;
        });
        builder.addCase(loginUserAsync.fulfilled, (state, action) => {
            console.log("app/state/authentication/authenticationSlice.ts : loginUserAsync.fulfilled : state = ", state);
            console.log("app/state/authentication/authenticationSlice.ts : loginUserAsync.fulfilled : action = ", action);
            state.loading = false;
            if(action.payload.status === 200) {
                state.user = action.payload.data;
                state.error = null;
                console.log("app/state/authentication/authenticationSlice.ts : loginUserAsync.fulfilled : cookieValue = ", action.payload.data);
                CookieUtils.setCookie("tokenid", action.payload.data.authentication.sessionToken, 0);
            }else{
                state.user = null;
                state.error = action.payload.message;
                console.log("app/state/authentication/authenticationSlice.ts : loginUserAsync.fulfilled : DELETING COOKIE = tokenid = ", CookieUtils.getCookie('tokenid'));
                CookieUtils.deleteCookie("tokenid");
            }   
        });
        builder.addCase(loginUserAsync.rejected, (state, action) => {
            console.log("app/state/authentication/authenticationSlice.ts : loginUserAsync.rejected : state = ", state);
            console.log("app/state/authentication/authenticationSlice.ts : loginUserAsync.rejected : action = ", action);
            state.loading = false;
            state.error = action.error.message || "Login failed";
            state.user = null;
        });
        builder.addCase(restoreSessionAsync.pending, (state) => {
            console.log("app/state/authentication/authenticationSlice.ts : restoreSessionAsync.pending : state = ", state);
            state.loading = true;
            state.error = null;
            // state.user = null;
            state.sessionChecked = false;
        });
        builder.addCase(restoreSessionAsync.fulfilled, (state, action) => {
            console.log("app/state/authentication/authenticationSlice.ts : restoreSessionAsync.fulfilled : state = ", state);
            console.log("app/state/authentication/authenticationSlice.ts : restoreSessionAsync.fulfilled : action = ", action);
            state.loading = false;
            state.sessionChecked = true;
            if(action.payload.status === 200) {
                state.user = action.payload.data;
                state.error = null;
            }else{
                state.user = null;
                state.error = action.payload.message;
                console.log("app/state/authentication/authenticationSlice.ts : restoreSessionAsync.fulfilled : DELETING COOKIE = tokenid = ", CookieUtils.getCookie('tokenid'));
                CookieUtils.deleteCookie("tokenid");
            }   
        });
        builder.addCase(restoreSessionAsync.rejected, (state, action) => {
            console.log("app/state/authentication/authenticationSlice.ts : restoreSessionAsync.rejected : state = ", state);
            console.log("app/state/authentication/authenticationSlice.ts : restoreSessionAsync.rejected : action = ", action);
            state.loading = false;
            state.sessionChecked = true;
            state.error = action.error.message || "Login failed";
            state.user = null;
            console.log("app/state/authentication/authenticationSlice.ts : restoreSessionAsync.fulfilled : DELETING COOKIE = tokenid = ", CookieUtils.getCookie('tokenid'));
            CookieUtils.deleteCookie("tokenid");
        });

        // Fetch User Details async thunk
        builder.addCase(fetchCurrentUserAsync.pending, (state) => {
            console.log("app/state/authentication/authenticationSlice.ts : fetchCurrentUserAsync.pending : state = ", state);
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCurrentUserAsync.fulfilled, (state, action) => {
            console.log("app/state/authentication/authenticationSlice.ts : fetchCurrentUserAsync.fulfilled : state = ", state);
            console.log("app/state/authentication/authenticationSlice.ts : fetchCurrentUserAsync.fulfilled : action = ", action);
            state.loading = false;
            if(action.payload && action.payload.data) {
                state.user = action.payload.data;
                state.error = null;
                console.log("app/state/authentication/authenticationSlice.ts : fetchCurrentUserAsync.fulfilled : user data updated = ", action.payload.data);
            }else{
                state.error = action.payload.message;
                console.log("app/state/authentication/authenticationSlice.ts : fetchCurrentUserAsync.fulfilled : invalid user data : ", action.payload);
            }   
        });
        builder.addCase(fetchCurrentUserAsync.rejected, (state, action) => {
            console.log("app/state/authentication/authenticationSlice.ts : fetchCurrentUserAsync.rejected : state = ", state);
            console.log("app/state/authentication/authenticationSlice.ts : fetchCurrentUserAsync.rejected : action = ", action);
            state.loading = false;
            state.error = action.error.message || "Login failed";
        });
    },
    reducers: {
        updateUserRole: (state, action) => {
            if(state.user) {
                state.user.role = action.payload;
            }
        },
        updateUserData: (state, action) => {
            state.user = action.payload;
        }
    }
});

export const {updateUserData, updateUserRole} = authenticationSlice.actions;
export default authenticationSlice.reducer;