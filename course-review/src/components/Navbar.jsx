import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css';
import Notifications from './Notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
    const [showNotifications, setShowNotifications] = useState(true);

    const handleToggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <nav className="navbar">
            <ul className="navbar-list">
                <li className="navbar-item">
                    <Link to="/home" className="navbar-link">Home</Link>
                </li>
                <li className="navbar-item">
                    <Link to="/courses" className="navbar-link">Courses</Link>
                </li>
                <li className="navbar-item">
                    <Link to="/profile" className="navbar-link">Profile</Link>
                </li>
                <li className="navbar-item">
                    <button className="notification-button" onClick={handleToggleNotifications}>
                        <FontAwesomeIcon icon={faBell} size="4x" style={{ opacity: showNotifications? 1 : 0.5 }} />
                    </button>
                    {showNotifications && <Notifications />}
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
