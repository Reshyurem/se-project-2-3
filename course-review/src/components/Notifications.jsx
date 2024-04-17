import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'

// firebase
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { auth, firestore } from '../firebase';

const Notifications = () => {
    const socket = io.connect('http://localhost:3000')
    const [subscriptions, setSubscriptions] = useState([]);

    // List of all events
    const allEvents = [
        'newReview',
        'newMessage',
        'friendRequest',
        // Add more events as needed
    ];

    useEffect(() => {
        // Fetch user's current subscriptions
        const fetchSubscriptions = async () => {
            try {
                const userDoc = await firebase.firestore().collection('users').where('uid', '==', auth.currentUser.uid).get();
                if (!userDoc.empty) {
                    const userData = userDoc.docs[0].data();
                    if (userData && userData.events) {
                        setSubscriptions(userData.events);
                    }
                }
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
            }
        };

        fetchSubscriptions();

        socket.on('newReviewAlert', (data) => {
            console.log("(CLIENT) [newReviewAlert]: ", data.review)
        })
    }, [auth.currentUser]);

    // Function to handle subscription toggle
    const toggleSubscription = async (event) => {
        try {
            const userDocRef = firebase.firestore().collection('users').doc(auth.currentUser.uid);
            const userDoc = await userDocRef.get();
            if (userDoc.exists) {
                let updatedSubscriptions = [];

                if (userDoc.data().events) {
                    updatedSubscriptions = [...userDoc.data().events];
                }

                if (updatedSubscriptions.includes(event)) {
                    // Unsubscribe
                    updatedSubscriptions = updatedSubscriptions.filter(sub => sub !== event);
                } else {
                    // Subscribe
                    updatedSubscriptions.push(event);
                }

                await userDocRef.update({
                    events: updatedSubscriptions
                });

                setSubscriptions(updatedSubscriptions);
            }
        } catch (error) {
            console.error('Error toggling subscription:', error);
        }
    };

    return (
        <div>
            <h2>Notifications</h2>
            <p>Subscribe to events:</p>
            <ul>
                {allEvents.map((event, index) => (
                    <li key={index}>
                        <button onClick={() => toggleSubscription(event)}>
                            {subscriptions.includes(event) ? 'Unsubscribe' : 'Subscribe'} to {event}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;
