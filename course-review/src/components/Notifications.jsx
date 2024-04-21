import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import '../css/Notifications.css';
import { auth, firestore } from '../firebase';
import io from 'socket.io-client'

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const userDoc = await firebase.firestore().collection('users').doc(auth.currentUser.uid).get();
                const userData = userDoc.data();
                setNotifications(userData.notifications || []);
            } catch (error) {
                console.error('Error fetching notifications: ', error);
            }
        };

        fetchNotifications();
    }, [auth.currentUser.uid]);

    useEffect(() => {
        const updateNotifications = async () => {
            try {
                const userRef = firebase.firestore().collection('users').where('uid', '==', auth.currentUser.uid);
                console.log("Updating");
                console.log(notifications);

                const querySnapshot = await userRef.get();
                console.log(typeof querySnapshot);
                if (!querySnapshot.empty) {
                    const promises = [];
                    querySnapshot.forEach((doc) => {
                        promises.push(doc.ref.update({
                            notifications: notifications
                        }));
                    });
                    await Promise.all(promises);

                    console.log('Notifications updated in Firestore successfully!');
                } else {
                    console.log('No matching documents.');
                }
            } catch (error) {
                console.error('Error updating notifications in Firestore: ', error);
            }
        };

        updateNotifications();
    }, [notifications]);


    useEffect(() => {
        const socket = io.connect('http://localhost:3000');

        if (auth.currentUser) {
            console.log("Checking for new review notifications for " + auth.currentUser.displayName);
            socket.on('newReviewAlert', (data) => {
                // Append new review alert to the notifications array
                setNotifications(prevNotifications => [...prevNotifications, data]);
            });
        }


        return () => {
            socket.off('newReviewAlert');
        };
    }, [auth.currentUser]);


    return (
        <div className="notifications-container">
            {notifications.length === 0 ? (
                <div className="notifications-empty">
                    No notifications
                </div>
            ) : (
                <div className="notifications-list">
                    {notifications.map((notification, index) => (
                        <div key={index} className="notification-item">{notification}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
