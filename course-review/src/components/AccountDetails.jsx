import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import firebase from 'firebase/compat/app';
import 'firebase/firestore';
import '../css/AccountDetails.css';

const AccountDetails = () => {
    const [userData, setUserData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const userRef = firebase.firestore().collection('users').where('uid', '==', auth.currentUser.uid);
            const snapshot = await userRef.get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                setUserData(doc.data());
                setUsername(doc.data().username || '');
                setEmail(doc.data().email || '');
                setPhoneNumber(doc.data().phoneNumber || '');
            } else {
                console.log('No such document!');
            }
        };
        fetchUserData();
    }, [auth.currentUser.uid]);

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePhoneNumberChange = (e) => {
        setPhoneNumber(e.target.value);
    };

    const handleSaveChanges = async () => {
        try {
            await firebase.firestore().collection('users').where('uid', '==', auth.currentUser.uid).get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    doc.ref.update({
                        username: username,
                        email: email,
                        phoneNumber: phoneNumber,
                    });
                });
            });
            setEditMode(false);
            console.log('Changes saved successfully!');
        } catch (error) {
            console.error('Error updating document: ', error);
        }
    };

    return (
        <div className="account-details">
            {userData && (
                <div className="user-details">
                    <h2>Account Details</h2>
                    <div className="info-container">
                        <div className="info-panel">
                            <p className="info-label">Username:</p>
                            <p className="info-value">{editMode ? <input type="text" value={username} onChange={handleUsernameChange} /> : username}</p>
                        </div>
                        <div className="info-panel">
                            <p className="info-label">Email:</p>
                            <p className="info-value">{editMode ? <input type="text" value={email} onChange={handleEmailChange} /> : email}</p>
                        </div>
                        <div className="info-panel">
                            <p className="info-label">Phone Number:</p>
                            <p className="info-value">{editMode ? <input type="text" value={phoneNumber} onChange={handlePhoneNumberChange} /> : phoneNumber}</p>
                        </div>
                    </div>
                    <div className="edit-container">
                        {editMode ? (
                            <button className="save-button" onClick={handleSaveChanges}>Save Changes</button>
                        ) : (
                            <button className="edit-button" onClick={() => setEditMode(true)}>Edit Details</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountDetails;