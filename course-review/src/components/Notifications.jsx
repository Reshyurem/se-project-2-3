import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { auth, firestore } from '../firebase';
import NotificationCard from './NotificationCard'; // Import the NotificationCard component

const NotificationHandler = () => {
    const [showNotification, setShowNotification] = useState(false);
    const [notificationData, setNotificationData] = useState(null);

    useEffect(() => {
        const socket = io.connect('http://localhost:3000');

        const handleNewReviewAlert = (data) => {
            console.log("Checking for new review notifications for " + auth.currentUser.displayName);
            setNotificationData(data);
            setShowNotification(true);
            setTimeout(() => {
                setShowNotification(false);
            }, 50000);
        };

        if (auth.currentUser) {
            socket.on('newReviewAlert', handleNewReviewAlert);
        }

        return () => {
            socket.off('newReviewAlert', handleNewReviewAlert);
        };
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
