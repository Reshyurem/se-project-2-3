import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';
import { auth, firestore } from '../firebase';
import '../css/Courses.css'; // Importing CSS file

const socket = io.connect('http://localhost:3000');

function Courses() {
    const [courses, setCourses] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [instructor, setInstructor] = useState('');
    const [currentUserDoc, setCurrentUserDoc] = useState(null);
    const [rerenderKey, setRerenderKey] = useState(0); // Add rerender key state

    useEffect(() => {
        const fetchUserDoc = async () => {
            try {
                const userRef = await firestore.collection('users').where('uid', '==', auth.currentUser.uid).get();
                if (!userRef.empty) {
                    setCurrentUserDoc(userRef.docs[0]);
                }
            } catch (error) {
                console.error('Error fetching user document: ', error);
            }
        };

        fetchUserDoc();
    }, []);

    useEffect(() => {
        // Fetch existing courses from Firestore
        const fetchCourses = async () => {
            try {
                const coursesSnapshot = await firestore.collection('courses').get();
                const coursesData = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCourses(coursesData);
            } catch (error) {
                console.error('Error fetching courses: ', error);
            }
        };

        fetchCourses();
    }, [currentUserDoc, rerenderKey]); // Add rerenderKey to the dependency array

    useEffect(() => {
        if (auth.currentUser) {
            console.log("Checking for new review notifications for " + auth.currentUser.displayName);
            socket.on('newReviewAlert', async (data) => {
                try {
                    const courseDoc = await firestore.collection('courses').doc(data.courseId).get();
                    const courseName = courseDoc.data().courseName;
                    console.log(`New review alert for course ${courseName}`);
                    // Emitting the course ID and course name
                    socket.emit('newReviewAlert', { courseId: data.courseId, courseName });
                } catch (error) {
                    console.error('Error fetching course name: ', error);
                }
            });
        }

        return () => {
            socket.off('newReviewAlert');
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Generate a unique course ID (you can use any method you prefer)
        const courseId = generateCourseId();

        // Create a new course object
        const newCourse = {
            courseId,
            courseName,
            instructor
        };

        // Add the new course to Firestore under the 'courses' collection
        try {
            const newCourseRef = await firestore.collection('courses').doc(); // Generates a random document ID
            await newCourseRef.set(newCourse); // Sets the data for the new course document
            console.log('Course added successfully!');
            // Update the list of courses
            setCourses(prevCourses => [...prevCourses, newCourse]);
        } catch (error) {
            console.error('Error adding course: ', error);
        }

        // Reset form fields
        setCourseName('');
        setInstructor('');
    };

    // Function to generate a unique course ID (you can customize this as needed)
    const generateCourseId = () => {
        // Implement your own logic to generate a unique course ID, for example:
        return Math.random().toString(36).substr(2, 9); // Random alphanumeric string
    };

    const isSubscribed = (courseId) => {
        return currentUserDoc && currentUserDoc.data().subscribedCourses && currentUserDoc.data().subscribedCourses.includes(courseId);
    };

    const handleSubscribe = async (courseId) => {
        try {
            if (currentUserDoc) {
                if (isSubscribed(courseId)) {
                    await currentUserDoc.ref.update({
                        subscribedCourses: firebase.firestore.FieldValue.arrayRemove(courseId)
                    });
                } else {
                    await currentUserDoc.ref.update({
                        subscribedCourses: firebase.firestore.FieldValue.arrayUnion(courseId)
                    });
                }
                console.log('Subscribed to course successfully!');
                // Update the rerender key to trigger a re-render
                setRerenderKey(prevKey => prevKey + 1);
            }
        } catch (error) {
            console.error('Error subscribing to course: ', error);
        }
    };

    return (
        <div className="courses-container">
            <h1>All Courses</h1>
            <div className="course-list">
                {courses.map(course => (
                    <div key={course.id} className="course-card">
                        <Link to={`/courses/${course.courseId}`} className="course-card-content">
                            <h2>{course.courseName}</h2>
                            <p>{course.instructor}</p>
                        </Link>
                        <div className="subscribe-icon" onClick={() => handleSubscribe(course.courseId)}>
                            <FontAwesomeIcon
                                icon={faBell}
                                style={{
                                    fontSize: "18px",
                                    color: isSubscribed(course.courseId) ? "yellow" : "#555555"
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="add-course">
                <h2>Add Course</h2>
                <form onSubmit={handleSubmit} className="course-form">
                    <label htmlFor="courseName" className="form-label">Course Name:</label>
                    <input
                        type="text"
                        id="courseName"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        required
                        className="form-input"
                    />
                    <label htmlFor="instructor" className="form-label">Instructor:</label>
                    <input
                        type="text"
                        id="instructor"
                        value={instructor}
                        onChange={(e) => setInstructor(e.target.value)}
                        required
                        className="form-input"
                    />
                    <button type="submit" className="submit-button">Add Course</button>
                </form>
            </div>
        </div>
    );
}

export default Courses;
