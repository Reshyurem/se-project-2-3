// import io from 'socket.io-client';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './css/App.css';

// firebase
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, firestore } from './firebase';

// components
import SignIn from './components/auth/SignIn';
import Home from './components/Home';
import Courses from './components/Courses';

// const socket = io('http://localhost:3001');

function App() {
    const [user] = useAuthState(auth);


    if (!user) { return (<SignIn />); }
    return (
        <Router>
            <Routes>
                <Route path="/" element={ <Home /> } />
                <Route path="/courses" element={ <Courses /> } />
            </Routes>
        </Router>
    );
}

export default App;