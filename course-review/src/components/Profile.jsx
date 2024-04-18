import React, { useState } from 'react';
import PubSub from 'pubsub-js';
import { auth, firestore } from '../firebase';

import Events from './Events'

function Profile() {


    return (
        <div>
            <h2>Profile</h2>
            <p>{auth.currentUser.displayName}</p>
            <Events />
        </div>
    );
}

export default Profile;
