import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../public/css/cloudService.css';
import { makeAuthGETReq } from './serverHelper';
import {toast} from 'react-toastify';



const FileUpload = ({ onUpload, btnLabel, initialFileUrl, accept }) => {
    
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileUrl, setUploadedFileUrl] = useState(initialFileUrl || null); // Prepopulate with initialFileUrl if exists
    const[REACT_APP_CLOUDINARY_CLOUD_NAME, setREACT_APP_CLOUDINARY_CLOUD_NAME] = useState(null);
    const[REACT_APP_CLOUDINARY_UPLOAD_PRESET, setREACT_APP_CLOUDINARY_UPLOAD_PRESET] = useState(null);
    

    useEffect(() => {
        const getData = async () => {
            try {
                console.log("Fetching temporary token...");
                // Step 1: Fetch the temporary token
                const tokenRes = await makeAuthGETReq("/api/generate-token");
                const token = tokenRes.token;
                console.log("Response:",token);
                // Step 2: Fetch the Cloudinary config using the token
                console.log("Fetching data from /api/config...");
                const res = await fetch("https://rythmix-backend-d16f.onrender.com/api/config", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Failed to fetch Cloudinary config");
                }

                const data = await res.json();
                console.log("Data fetched successfully:", data);

                // Step 3: Update state with fetched Cloudinary config
                setREACT_APP_CLOUDINARY_CLOUD_NAME(data.cloudName);
                setREACT_APP_CLOUDINARY_UPLOAD_PRESET(data.cloudPwd);
            } catch (error) {
                console.error("An error occurred inside useEffect:", error.message);
                toast.error("Error: " + error.message);
            }
        };

        getData();
    }, []);

    

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setUploadedFileUrl(null); // Reset when a new file is selected
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', REACT_APP_CLOUDINARY_UPLOAD_PRESET);

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                }
            );

            const fileUrl = response.data.secure_url;
            setIsUploading(false);
            setUploadedFileUrl(fileUrl);
            onUpload(fileUrl);
        } catch (error) {
            console.error('Error uploading file:', error);
            setIsUploading(false);
        }
    };

    return (
        <div className="input">
            <div className="file-input-wrapper">
                <input type="file" accept={accept} onChange={handleFileChange} />
                {uploadedFileUrl && (
                    <i className="fa-regular fa-circle-check upload-success-icon"></i>
                )}
            </div>
            <button onClick={handleUpload} disabled={!file || isUploading} className="uploadButton">
                {isUploading ? 'Uploading...' : `Upload ${btnLabel}`}
            </button>

            {isUploading && (
                <div className="progress-circle">
                    <svg className="progress-ring" width="60" height="60">
                        <circle
                            className="progress-ring__background"
                            stroke="lightgrey"
                            strokeWidth="4"
                            fill="transparent"
                            r="25"
                            cx="30"
                            cy="30"
                        />
                        <circle
                            className="progress-ring__circle"
                            stroke="green"
                            strokeWidth="4"
                            fill="transparent"
                            r="25"
                            cx="30"
                            cy="30"
                            style={{
                                strokeDasharray: `${2 * Math.PI * 25}`,
                                strokeDashoffset: `${2 * Math.PI * 25 * (1 - uploadProgress / 100)}`,
                            }}
                        />
                    </svg>
                    <p className="progress-percentage">{uploadProgress}%</p>
                </div>
            )}

            {uploadedFileUrl && !isUploading && (
                <div className="view-file-wrapper">
                    <i className="fa-regular fa-eye view-file-icon" onClick={() => window.open(uploadedFileUrl, '_blank')}></i>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
