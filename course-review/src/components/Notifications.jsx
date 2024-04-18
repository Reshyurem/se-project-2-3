import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'

// firebase
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { auth, firestore } from '../firebase';

const Notifications = () => {


    useEffect(() => {
        // Connect to the Socket.IO server
        const socket = io('http://localhost:3000'); // Replace 'http://localhost:3000' with your Socket.IO server address

        // Listen for 'newReviewAlert' event from the server
        console.log("Notifications")

        const fetchData = async () => {
            const usersRef = firestore.collection('users');
            const querySnapshot = await usersRef.where('uid', '==', auth.currentUser.uid).get();

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                if (userData.events) {
                    if (userData.events.newReview) {
                        console.log("newReview notifications on " + auth.currentUser.displayName)
                        socket.on('newReviewAlert', (data) => {
                            // Handle the new review alert here
                            console.log('New review alert received:', data);
                        });
                    }
                    if (userData.events.newCourse) {
                        socket.on('newCourseAlert', (data) => {
                            // Handle the new course alert here
                            console.log('New course alert received:', data);
                        });
                    }
                    if (userData.events.newMessage) {
                        socket.on('newMessageAlert', (data) => {
                            // Handle the new message alert here
                            console.log('New message alert received:', data);
                        });
                    }
                }
            }
        };

        fetchData();


        return () => {
            socket.disconnect();
        };
    }, []);



    return (
        <div>
            <h2>Notifications</h2>
        </div>
    );
};

export default Notifications;
