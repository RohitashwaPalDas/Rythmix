import { backendUrl } from './config';

export const makeUnauthPOSTReq = async (route, data) => {
    const urlEncodedData = new URLSearchParams(data).toString();

    const response = await fetch(`https://rythmix-sbzw.onrender.com${route}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: urlEncodedData,
        credentials: 'include',
    });

    if (!response.ok) {
        // Handle non-OK responses like 401
        const errorText = await response.text(); // Read the response as text
        return { err: errorText }; // Return error message
    }

    const result = await response.json(); // If OK, parse as JSON
    return result;
};



export const makeAuthPOSTReq = async (route, data) => {
    try {
        const urlEncodedData = new URLSearchParams(data).toString();

        const response = await fetch(`https://rythmix-sbzw.onrender.com${route}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: urlEncodedData,
            credentials: 'include' // Include credentials (cookies) with the request
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Request failed!');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error occurred:", error.message);
        return { error: error.message };
    }
};

export const makeAuthPUTReq = async (route, data) => {
    try {
        const urlEncodedData = new URLSearchParams(data).toString();

        const response = await fetch(`https://rythmix-sbzw.onrender.com${route}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: urlEncodedData,
            credentials: 'include' // Include credentials (cookies) with the request
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Request failed!');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error occurred:", error.message);
        return { error: error.message };
    }
};

export const makeAuthGETReq = async (route) => {
    try {
        const response = await fetch(`https://rythmix-sbzw.onrender.com${route}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // Include credentials (cookies) with the request
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Request failed!');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error occurred:", error.message);
        return { error: error.message };
    }
};

export const makeAuthDELETEReq = async (route) => {
    try {
        const response = await fetch(`https://rythmix-sbzw.onrender.com${route}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // Include credentials (cookies) with the request
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Request failed!');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error occurred:", error.message);
        return { error: error.message };
    }
};