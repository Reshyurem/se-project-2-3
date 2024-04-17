import React, { useState } from 'react';
import PubSub from 'pubsub-js';

import Events from './Events'

function Profile() {

    return (
        <div>
            <h2>Profile</h2>
            <Events />
        </div>
    );
}

export default Profile;
