import { backendUrl } from './config';

export const makeUnauthPOSTReq = async (route, data) => {
    const urlEncodedData = new URLSearchParams(data).toString();

<<<<<<< HEAD
    const response = await fetch(`https://rythmix-backend-emov.onrender.com${route}`, {
=======
    const response = await fetch(`https://rythmix-backend-d16f.onrender.com${route}`, {
>>>>>>> a7790b6 (frontend url updated)
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

<<<<<<< HEAD
        const response = await fetch(`https://rythmix-backend-emov.onrender.com${route}`, {
=======
        const response = await fetch(`https://rythmix-backend-d16f.onrender.com${route}`, {
>>>>>>> a7790b6 (frontend url updated)
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

<<<<<<< HEAD
        const response = await fetch(`https://rythmix-backend-emov.onrender.com${route}`, {
=======
        const response = await fetch(`https://rythmix-backend-d16f.onrender.com${route}`, {
>>>>>>> a7790b6 (frontend url updated)
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
<<<<<<< HEAD
        const response = await fetch(`https://rythmix-backend-emov.onrender.com${route}`, {
=======
        const response = await fetch(`https://rythmix-backend-d16f.onrender.com${route}`, {
>>>>>>> a7790b6 (frontend url updated)
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
<<<<<<< HEAD
        const response = await fetch(`https://rythmix-backend-emov.onrender.com${route}`, {
=======
        const response = await fetch(`https://rythmix-backend-d16f.onrender.com${route}`, {
>>>>>>> a7790b6 (frontend url updated)
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











