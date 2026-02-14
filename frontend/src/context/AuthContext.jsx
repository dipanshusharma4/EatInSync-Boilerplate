import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Configure axios defaults
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Adjust if needed

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    // Assuming you have a /users/me endpoint
                    const response = await axios.get('/users/me');
                    const userData = response.data;
                    setUser(userData);

                    if (window.location.pathname !== '/onboarding' && !userData.onboarding_completed) {
                        navigate('/onboarding');
                    }

                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, [navigate]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/token', {
                username: email,
                password: password
            });
            const { access_token } = response.data;

            localStorage.setItem('token', access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            // Get user data immediately
            const userResponse = await axios.get('/users/me');
            setUser(userResponse.data);

            if (!userResponse.data.onboarding_completed) {
                navigate('/onboarding');
                return true;
            }

            // Navigate to where they were trying to go, or home
            const origin = location.state?.from?.pathname || '/analyze';
            navigate(origin);
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            throw error; // Rethrow to handle in UI
        }
    };

    const googleLogin = async (token) => {
        try {
            const response = await axios.post('/google', { token });
            const { access_token } = response.data;

            localStorage.setItem('token', access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            // Get user data immediately
            const userResponse = await axios.get('/users/me');
            setUser(userResponse.data);

            if (!userResponse.data.onboarding_completed) {
                navigate('/onboarding');
                return true;
            }

            // Navigate to where they were trying to go, or home
            const origin = location.state?.from?.pathname || '/analyze';
            navigate(origin);
            return true;
        } catch (error) {
            console.error("Google Login failed:", error);
            throw error;
        }
    };

    const signup = async (email, password, fullName) => {
        try {
            await axios.post('/signup', {
                email,
                full_name: fullName,
                password
            });
            // Automatically login after signup
            return login(email, password);
        } catch (error) {
            console.error("Signup failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        navigate('/');
    };

    const value = {
        user,
        login,
        googleLogin,
        signup,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
