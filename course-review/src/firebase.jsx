// firebase
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyA3xL5ioXcPsSLuYy0Tr-aStc5ssNI3g-w",
    authDomain: "course-review-fd498.firebaseapp.com",
    projectId: "course-review-fd498",
    storageBucket: "course-review-fd498.appspot.com",
    messagingSenderId: "128569235135",
    appId: "1:128569235135:web:7cdc30bb4cfd5ed81a980a",
    measurementId: "G-JJV9KP0WBT"
});

export const auth = firebase.auth();
export const firestore = firebase.firestore();