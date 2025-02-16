import React, { useState, createContext, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        if (storedUser) {
            setCurrentUser(storedUser);
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    // Poll the backend to check if the user is still authenticated
    useEffect(() => {
        const checkAuthStatus = async () => {
            if (currentUser) {
                try {
                    const res = await fetch(`https://rythmix-sbzw.onrender.com/auth/check`, {
                        method: 'POST',
                        credentials: 'include'
                    });

                    const result = await res.json();

                    if (!res.ok || !result.authenticated) {
                        setCurrentUser(null); // Log out user on the frontend
                    }
                } catch (error) {
                    console.error('Error checking authentication status:', error);
                    setCurrentUser(null); // Log out user on the frontend
                }
            }
        };

        const interval = setInterval(checkAuthStatus, 5000); // Poll every 5 seconds (adjust as needed)

        return () => clearInterval(interval);
    }, [currentUser]);

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
