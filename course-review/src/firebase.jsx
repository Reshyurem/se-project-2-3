// firebase
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { initializeApp } from "firebase/app";


firebase.initializeApp({
    apiKey: "AIzaSyCUEe7RmC_CKpQd42BGYr5uso0Mwa_jkSw",
  authDomain: "course-review-2.firebaseapp.com",
  projectId: "course-review-2",
  storageBucket: "course-review-2.appspot.com",
  messagingSenderId: "308484344408",
  appId: "1:308484344408:web:5157f5aea6ceb6c934582d",
  measurementId: "G-3NVK60Y1YS"
});

export const auth = firebase.auth();
export const firestore = firebase.firestore();