import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../css/Events.css';

// firebase
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { auth, firestore } from '../firebase';

const Events = () => {
    const [subscribedEvents, setSubscribedEvents] = useState(null); // Initialize state to null

    useEffect(() => {
        // Fetch user document from Firestore
        const user = firebase.auth().currentUser;
        if (user) {
            const docRef = firebase.firestore().collection('users').where('uid', '==', user.uid);
            docRef.get().then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        const userData = doc.data();
                        setSubscribedEvents(userData.events); // Set subscribedEvents state with the events object from Firestore
                    });
                } else {
                    console.log('No matching document found!');
                }
            }).catch((error) => {
                console.log('Error getting documents:', error);
            });
        }
    }, []);

    const handleToggle = async (event) => {
        try {
            const user = firebase.auth().currentUser;
            if (user) {
                const docRef = firebase.firestore().collection('users').where('uid', '==', user.uid);
                const snapshot = await docRef.get();
                if (!snapshot.empty) {
                    snapshot.forEach(async (doc) => {
                        const docId = doc.id;
                        const userData = doc.data();
                        const updatedEvents = { ...userData.events, [event]: !userData.events[event] };
                        await firebase.firestore().collection('users').doc(docId).update({
                            events: updatedEvents
                        });
                        setSubscribedEvents(updatedEvents);
                    });
                } else {
                    console.log('No matching document found!');
                }
            }
        } catch (error) {
            console.error('Error toggling event:', error);
        }
    };

    const handleSaveSettings = () => {
        window.location.reload(); // Refresh the page
    };

    if (!subscribedEvents) {
        return <div>Loading...</div>; // Add loading indicator while fetching initial values
    }

    return (
        <div className="events-panel">
            <h2>Events</h2>
            <div className="event-container">
                <div className="event">
                    <span>New Review</span>
                    <div className={`${subscribedEvents.newReview ? 'toggle-on' : 'toggle-off'}`} onClick={() => handleToggle('newReview')}>
                        <div className={`slider ${subscribedEvents.newReview ? 'subscribed' : ''}`}></div>
                    </div>
                </div>
                <div className="event">
                    <span>New Course</span>
                    <div className={`${subscribedEvents.newCourse ? 'toggle-on' : 'toggle-off'}`} onClick={() => handleToggle('newCourse')}>
                        <div className={`slider ${subscribedEvents.newCourse ? 'subscribed' : ''}`} ></div>
                    </div>
                </div>
                <div className="event">
                    <span>New Message</span>
                    <div className={`${subscribedEvents.newMessage ? 'toggle-on' : 'toggle-off'}`} onClick={() => handleToggle('newMessage')}>
                        <div className={`slider ${subscribedEvents.newMessage ? 'subscribed' : ''}`} ></div>
                    </div>
                </div>
                <div className="event">
                    <span>Friend Request</span>
                    <div className={`${subscribedEvents.friendRequest ? 'toggle-on' : 'toggle-off'}`} onClick={() => handleToggle('friendRequest')}>
                        <div className={`slider ${subscribedEvents.friendRequest ? 'subscribed' : ''}`}></div>
                    </div>
                </div>
            </div>
            <button onClick={handleSaveSettings} className="save-settings-button">Save Settings</button>
        </div>
    );
};

export default Events;
