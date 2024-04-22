import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { auth, firestore } from '../firebase';
import NotificationCard from './NotificationCard'; // Import the NotificationCard component
import axios from 'axios'; // Axios for HTTP requests


const NotificationHandler = () => {
    const [showNotification, setShowNotification] = useState(false);
    const [notificationData, setNotificationData] = useState(null);

    const microserviceBaseURL = 'http://localhost:8000'; // Your FastAPI microservice base URL

    useEffect(() => {
        const socket = io.connect('http://localhost:3000');

        const handleNewReviewAlert = (data) => {
            console.log("Checking for new review notifications for " + auth.currentUser.displayName);
            setNotificationData(data);
            setShowNotification([true]);
            setTimeout(() => {
                setShowNotification([false]);
            }, 50000);
        };

        while (auth.currentUser) {
            let request = axios.get(`${microserviceBaseURL}/notifications/${auth.currentUser.uid}`)
            .then((response) => {
                if (response.message) {
                    handleNewReviewAlert(response.message);
                }
            })
            // Delay the next request by 5 seconds
            .then(() => new Promise(resolve => setTimeout(resolve, 5000)));
        }
    }, []);

    const handleCloseNotification = () => {
        setShowNotification(false);
    };

    return (
        <>
            {showNotification && (
                <NotificationCard data={notificationData} onClose={handleCloseNotification} />
            )}
        </>
    );
};

export default NotificationHandler;
