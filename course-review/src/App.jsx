import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
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
import Navbar from './components/Navbar';
import Courses from './components/Courses';
import Course from './components/Course';
import Profile from './components/Profile';
import Notifications from './components/Notifications';


function App() {
    const [user] = useAuthState(auth);
    const [courses, setCourses] = useState([]);



    if (!user) { return (<SignIn />); }

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/profile" element={<Profile />} />
                {/* Iterate through courses and create routes */}
                {courses.map(course => (
                    <Route
                        key={course.courseId}
                        path={`/courses/${course.courseId}`}
                        element={<Course courseId={course.id} />} // Assuming you have a Course component
                    />
                ))}
            </Routes>
        </Router>
    );
}

export default App;
