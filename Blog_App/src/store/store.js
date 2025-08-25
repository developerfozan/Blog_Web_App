import {configureStore} from "@reduxjs/toolkit";
import authSlice from "./authSlice"
import postSlice from "./postSlice";

const store = configureStore({
    reducer:{
        auth: authSlice,
        // The authSlice is used to manage authentication state 
        post: postSlice,
        // The postSlice is used to manage blog post state
    }
});

export default store;