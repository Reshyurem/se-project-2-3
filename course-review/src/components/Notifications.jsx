// import React, { useState, useEffect } from 'react';
// import { io } from 'socket.io-client';
// import { auth, firestore } from '../firebase';
// import NotificationCard from './NotificationCard'; // Import the NotificationCard component

// const Notifications = () => {
//     const [showNotification, setShowNotification] = useState(false);
//     const [notificationData, setNotificationData] = useState(null);
//     console.log("Notifications")

//     useEffect(() => {
//         const socket = io.connect('http://localhost:3000');

//         const handleNewReviewAlert = async (data) => {
//             // Fetch user's subscribedCourses array from Firestore
//             try {
//                 const userDocQuery = await firestore.collection('users').where('uid', '==', auth.currentUser.uid).get();
//                 if (!userDocQuery.empty) {
//                     const userData = userDocQuery.docs[0].data();
//                     if (userData && userData.subscribedCourses) {
//                         const subscribedCourses = userData.subscribedCourses;
//                         if (!subscribedCourses.includes(data.courseId)) {
//                             return; // Don't show the notification
//                         }
//                         if(data.userId == auth.currentUser.uid) {
//                             return;
//                         }
//                     }
//                 }
//             } catch (error) {
//                 console.error('Error fetching subscribed courses: ', error);
//             }

//             setNotificationData(data);
//             setShowNotification([true]);
//             setTimeout(() => {
//                 setShowNotification([false]);
//             }, 8000);
//         };

//         if (auth.currentUser) {
//             socket.on('newReviewAlert', handleNewReviewAlert);
//         }

//         return () => {
//             socket.off('newReviewAlert', handleNewReviewAlert);
//         };
//     }, []);

//     const handleCloseNotification = () => {
//         setShowNotification(false);
//     };

//     return (
//         <>
//             {showNotification && (
//                 <NotificationCard data={notificationData} onClose={handleCloseNotification} />
//             )}
//         </>
//     );
// };

// export default Notifications;

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

        const handleNewReviewAlert = async (data) => {
            console.log("Checking for new review notifications for " + auth.currentUser.displayName);
            setNotificationData(data);
            setShowNotification([true]);
            setTimeout(() => {
                setShowNotification([false]);
            }, 50000);
        };

        if (auth.currentUser) {
            let request = axios.get(`${microserviceBaseURL}/notifications/${auth.currentUser.uid}`)
            .then((response) => {
                console.log(response)
                console.log(response.data)
                console.log(response.data.length)
                let l = response.data.length
                if(response.data.length > 0) {
                    for(let i = 0; i < l; i++) {
                        handleNewReviewAlert(response.data[i].message);
                    }
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
