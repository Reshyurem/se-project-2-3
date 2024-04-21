import React, { useState } from 'react';
import AccountDetails from './AccountDetails';
import Events from './Events';
import '../css/Profile.css';

function Profile() {
    const [activeComponent, setActiveComponent] = useState('account');

    const handleComponentChange = (component) => {
        setActiveComponent(component);
    };

    return (
        <div className="container">
            <div className="sidebar">
                <button className={activeComponent === 'account' ? 'active' : 'sidebar-button'} onClick={() => handleComponentChange('account')}>
                    Account Information
                </button>
                <button className={activeComponent === 'events' ? 'active' : 'sidebar-button'} onClick={() => handleComponentChange('events')}>
                    Notifications
                </button>
            </div>
            <div className="main-content">
                {activeComponent === 'account' && <AccountDetails />}
                {activeComponent === 'events' && <Events />}
            </div>
        </div>
    );
}

export default Profile;
