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

        // check if user already exists
        firestore.collection('users').doc(user.uid).get().then((doc) => {
            if (!doc.exists) {
                console.log("Creating user")
                console.log(user);



                // Add the user to the 'users' collection with accountType
                if (user) {
                    // Validation
                    if (!user.uid || !user.displayName || !user.email) {
                        alert("There was a problem creating the user account. Please try again.")
                        return
                    }
                    if (!accountType) {
                        alert("Please select an account type.")
                        return
                    }

                    firestore.collection('users').doc(user.uid).set({
                        uid: user.uid,
                        username: user.displayName,
                        email: user.email,
                        phone: user.phoneNumber,
                        photoURL: user.photoURL,
                        accountType: type,
                        events: {
                            newReview: false,
                            newCourse: false,
                            newMessage: false,
                            friendRequest: false
                        },
                        subscribedCourses: [],
                    })
                        .then(() => {
                            console.log("User account created successfully.");
                            console.log("user is ", user)
                            // store user in local storage
                            localStorage.setItem('user', JSON.stringify(user));
                            // store account type in local storage
                            localStorage.setItem('accountType', type);
                            console.log(localStorage.getItem('user'));
                            console.log(localStorage.getItem('accountType'));
                        })
                        .catch((error) => {
                            console.error("Error creating user account: ", error);
                        });
                }

            } else {
                console.log("User already exists");
                // store user in local storage
                localStorage.setItem('user', JSON.stringify(user));
                console.log(localStorage.getItem('user'));
                // store account type in local storage
                localStorage.setItem('accountType', doc.data().accountType);
                console.log(localStorage.getItem('accountType'));
                return
            }
        });


    };

    const signInWithType = (type) => {
        // Set the accountType state
        console.log("User has set account type to ", type)
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
                <button className={`account-type-btn ${accountType === 'admin' ? 'account-type-active' : ''}`} onClick={() => signInWithType('admin')}>Admin</button>
            </div>
        </div>
    );
}

export default SignIn;
