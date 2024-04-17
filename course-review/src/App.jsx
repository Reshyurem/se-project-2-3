import { useEffect, useState } from 'react';
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
import Navbar from './components/Navbar';
import Courses from './components/Courses';
import Course from './components/Course';
import Profile from './components/Profile';

function App() {
    const [user] = useAuthState(auth);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const unsubscribe = firestore.collection('courses').onSnapshot(snapshot => {
            const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCourses(coursesData);
        });

        return () => unsubscribe();
    }, []);

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
                        key={course.id}
                        path={`/courses/${course.id}`}
                        element={<Course courseId={course.id} />} // Assuming you have a Course component
                    />
                ))}
            </Routes>
        </Router>
    );
}

export default App;
