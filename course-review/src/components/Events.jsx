import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../css/Events.css';

const Events = () => {
    const [subscribedEvents, setSubscribedEvents] = useState([]);

    useEffect(() => {
        // Connect to the Socket.IO server
        const socket = io('http://localhost:3000'); // Replace 'http://localhost:3000' with your Socket.IO server address

        // Listen for 'newReviewAlert' event from the server
        console.log("Listening to 'newReviewAlert' event")
        socket.on('newReviewAlert', (data) => {
            // Handle the new review alert here
            console.log('New review alert received:', data);
        });

        // // Clean up the event listener when the component unmounts
        // return () => {
        //     socket.off('newReviewAlert');
        //     socket.disconnect();
        // };
    }, []);
    

    const handleToggle = (event) => {
        if (subscribedEvents.includes(event)) {
            setSubscribedEvents(subscribedEvents.filter((e) => e !== event));
        } else {
            setSubscribedEvents([...subscribedEvents, event]);
        }
    };

    return (
        <div className="events-panel">
            <h2>Events</h2>
            <div className="event-container">
                <div className="event">
                    <span>New Review</span>
                    <div className="toggle-button">
                        <div className={`slider ${subscribedEvents.includes('newReview') ? 'subscribed' : ''}`} onClick={() => handleToggle('newReview')}></div>
                    </div>
                </div>
                <div className="event">
                    <span>New Course</span>
                    <div className="toggle-button">
                        <div className={`slider ${subscribedEvents.includes('newCourse') ? 'subscribed' : ''}`} onClick={() => handleToggle('newCourse')}></div>
                    </div>
                </div>
                <div className="event">
                    <span>New Message</span>
                    <div className="toggle-button">
                        <div className={`slider ${subscribedEvents.includes('newMessage') ? 'subscribed' : ''}`} onClick={() => handleToggle('newMessage')}></div>
                    </div>
                </div>
                <div className="event">
                    <span>Friend Request</span>
                    <div className="toggle-button">
                        <div className={`slider ${subscribedEvents.includes('friendRequest') ? 'subscribed' : ''}`} onClick={() => handleToggle('friendRequest')}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Events;
