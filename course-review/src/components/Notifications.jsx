import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { auth, firestore } from '../firebase';
import NotificationCard from './NotificationCard'; // Import the NotificationCard component

const Notifications = () => {
    const [showNotification, setShowNotification] = useState(false);
    const [notificationData, setNotificationData] = useState(null);
    console.log("Notifications")

    useEffect(() => {
        const socket = io.connect('http://localhost:3000');

        const handleNewReviewAlert = async (data) => {
            // Fetch user's subscribedCourses array from Firestore
            try {
                const userDocQuery = await firestore.collection('users').where('uid', '==', auth.currentUser.uid).get();
                if (!userDocQuery.empty) {
                    const userData = userDocQuery.docs[0].data();
                    if (userData && userData.subscribedCourses) {
                        const subscribedCourses = userData.subscribedCourses;
                        if (!subscribedCourses.includes(data.courseId)) {
                            return; // Don't show the notification
                        }
                        if(data.userId == auth.currentUser.uid) {
                            return;
                        }
                    }
                    if (userData && userData.events) {
                        const events = userData.events;
                        if (!events.newReview) {
                            return; // Don't show the notification
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching subscribed courses: ', error);
            }

            setNotificationData(data);
            setShowNotification(true);
            setTimeout(() => {
                setShowNotification(false);
            }, 8000);
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

export default Notifications;
