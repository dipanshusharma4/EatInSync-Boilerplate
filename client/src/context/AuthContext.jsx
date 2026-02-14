import React, { createContext, useReducer, useEffect, useContext } from 'react';
import axios from 'axios';

// Initial State
const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null
};

// Create Context
const AuthContext = createContext(initialState);

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload
            };
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading: false,
                error: null
            };
        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
                error: action.payload
            };
        case 'CLEAR_ERRORS':
            return { ...state, error: null };
        default:
            return state;
    }
};

// Provider Component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load User
    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
            dispatch({ type: 'AUTH_ERROR' });
            return;
        }

        try {
            const res = await axios.get('http://localhost:5000/api/auth/user');
            dispatch({ type: 'USER_LOADED', payload: res.data });
        } catch (err) {
            console.error("Load user failed", err);
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    // Register User
    const register = async formData => {
        console.log("Registering user...", formData);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
            console.log("Register success", res.data);
            dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
            // loadUser(); // No longer needed immediately as backend returns user
        } catch (err) {
            console.error("Register failed", err.response?.data);
            dispatch({ type: 'LOGIN_FAIL', payload: err.response?.data?.msg || 'Registration failed' });
            throw err;
        }
    };

    // Login User
    const login = async formData => {
        console.log("Logging in user...");
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            console.log("Login success", res.data);
            dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
            // loadUser(); // No longer needed immediately
        } catch (err) {
            console.error("Login failed", err.response?.data);
            dispatch({ type: 'LOGIN_FAIL', payload: err.response?.data?.msg || 'Login failed' });
            throw err;
        }
    };

    // Logout
    const logout = () => dispatch({ type: 'LOGOUT' });

    // Clear Errors
    const clearErrors = () => dispatch({ type: 'CLEAR_ERRORS' });

    // Load user on first render if token exists
    useEffect(() => {
        if (localStorage.getItem('token')) {
            loadUser();
        } else {
            dispatch({ type: 'AUTH_ERROR' }); // Ensure loading is false
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            token: state.token,
            isAuthenticated: state.isAuthenticated,
            loading: state.loading,
            user: state.user,
            error: state.error,
            loadUser,
            register,
            login,
            logout,
            clearErrors
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
