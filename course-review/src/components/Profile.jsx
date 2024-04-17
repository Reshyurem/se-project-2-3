import React, { useState } from 'react';
import PubSub from 'pubsub-js';

function Profile() {
    const [notifications, setNotifications] = useState([]);
    console.log(PubSub)
    console.log(typeof PubSub)

    // Function to subscribe to the "newReview" topic
    const subscribeToNewReview = () => {
        // Subscribe to the "newReview" topic
        console.log("Hello")
        const subscription = PubSub.subscribe('newReview', (topic, newReviewData) => {
            // Update notifications state with the new review data
            setNotifications(prevNotifications => [...prevNotifications, newReviewData]);
        });

        // Store the subscription for later unsubscribing
        return subscription;
    };

    // Handle click event for subscribing to "newReview"
    const handleSubscribeClick = () => {
        const subscription = subscribeToNewReview();
        // Optionally, you can store the subscription in state or a ref for later use or cleanup
    };

    // Render notifications list
    const renderNotifications = () => {
        return (
            <ul>
                {notifications.map((notification, index) => (
                    <li key={index}>{notification.review}</li>
                ))}
            </ul>
        );
    };

    return (
        <div>
            <h2>Profile</h2>
            <button onClick={handleSubscribeClick}>Subscribe to newReview</button>
            <h3>Notifications</h3>
            {renderNotifications()}
        </div>
    );
}

export default Profile;
