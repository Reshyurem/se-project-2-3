import React, { useState } from 'react';
import '../../css/Auth.css';

// firebase
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, firestore } from '../../firebase';

function SignIn() {
    const [accountType, setAccountType] = useState(null); // Initialize accountType state

    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).then(() => {
            // Call createUserAccount with the current accountType
            if (accountType) {
                createUserAccount(accountType);
            }
        });
    };

    const signInWithGithub = () => {
        const provider = new firebase.auth.GithubAuthProvider();
        auth.signInWithPopup(provider).then(() => {
            // Call createUserAccount with the current accountType
            if (accountType) {
                createUserAccount(accountType);
            }
        });
    };

    const createUserAccount = (type) => {
        // Get the current user
        const user = auth.currentUser;

        // Add the user to the 'users' collection with accountType
        if (user) {
            firestore.collection('users').doc(user.uid).set({
                accountType: type
            })
                .then(() => {
                    console.log("User account created successfully.");
                })
                .catch((error) => {
                    console.error("Error creating user account: ", error);
                });
        }
    };

    const signInWithType = (type) => {
        // Set the accountType state
        setAccountType(type);
    };

    return (
        <div className="sign-in-container">
            <div className="sign-in-buttons">
                <button className="sign-in-btn" onClick={signInWithGoogle}>Sign In With Google</button>
                <button className="sign-in-btn" onClick={signInWithGithub}>Sign In With Github</button>
            </div>
            <div className="account-type-container">
                <button className={`account-type-btn ${accountType === 'student' ? 'account-type-active' : ''}`} onClick={() => signInWithType('student')}>Student</button>
                <button className={`account-type-btn ${accountType === 'professor' ? 'account-type-active' : ''}`} onClick={() => signInWithType('professor')}>Professor</button>
            </div>
        </div>
    );
}

export default SignIn;
