import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css'
import Notifications from './Notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
    const [showNotifications, setShowNotifications] = useState([false]);

    const handleToggleNotifications = () => {
        let temp = [!showNotifications[0]];
        setShowNotifications([...temp]);
        console.log(temp);
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
                    <button className="notification-button" 
                    onClick={handleToggleNotifications}>
                        <FontAwesomeIcon id="bell" icon={faBell} style={{ color : showNotifications[0] ? "yellow" : "#555555" }}size="4x" />
                    </button>
                    {showNotifications[0] && <Notifications />}
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
