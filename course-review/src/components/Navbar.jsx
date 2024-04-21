import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css'
import Notifications from './Notifications';

const Navbar = () => {
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
                {/* <li className="navbar-item">
                    <Notifications />
                </li> */}
            </ul>
        </nav>
    );
};

export default Navbar;
