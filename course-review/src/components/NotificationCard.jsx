import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import '../css/NotificationCard.css';

const NotificationCard = ({ data, onClose }) => {
    return (
        <div className="notification-card">
            <div className="notification-header">
                <FontAwesomeIcon icon={faBell} style={{ fontSize: "18px", color: "yellow" }} />
                <div className="notification-title">{data.username} posted a review in {data.courseName}</div>
            </div>
            <span className="close-btn" onClick={onClose}>x</span>
            <p className="notification-data">{data.review}</p>
        </div>
    );
};

export default NotificationCard;
