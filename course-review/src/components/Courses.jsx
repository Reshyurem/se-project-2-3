import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';
import { auth, firestore } from '../firebase';
import '../css/Courses.css'; // Importing CSS file

// const socket = io.connect('http://localhost:3000');

function Courses() {
    const [courses, setCourses] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [instructor, setInstructor] = useState('');
    const [courseId, setCourseId] = useState('');
    const [userId, setUserId] = useState('');
    const [currentUserDoc, setCurrentUserDoc] = useState(null);
    const [rerenderKey, setRerenderKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

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

    // useEffect(() => {
    //     if (auth.currentUser) {
    //         console.log("Checking for new review notifications for " + auth.currentUser.displayName);
    //         socket.on('newReviewAlert', async (data) => {
    //             try {
    //                 const courseDoc = await firestore.collection('courses').doc(data.courseId).get();
    //                 const courseName = courseDoc.data().courseName;
    //                 console.log(`New review alert for course ${courseName}`);
    //                 // Emitting the course ID and course name
    //                 socket.emit('newReviewAlert', { courseId: data.courseId, courseName });
    //             } catch (error) {
    //                 console.error('Error fetching course name: ', error);
    //             }
    //         });
    //     }

    //     return () => {
    //         socket.off('newReviewAlert');
    //     };
    // }, []);

    const filteredCourses = courses.filter(course => {
        return course.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

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

    const handleSubmitAdd = async (e) => {
        e.preventDefault();

        // Add the courseId, if it exists in the courses collection, to the user's courses
        try {
            // get the course from the courses collection where courseId is equal to the courseId entered
            console.log(courseId);
            const courseOut = await firebase.firestore().collection('courses')
                .where('courseId', '==', courseId)
                .limit(1)
                .get();
                console.log(courseOut);
            if (courseOut.empty) {
                console.error('Course does not exist!');
                return;
            }
            const courseRef = courseOut.docs[0];
            console.log(courseRef);
            if (courseRef.exists) {
                const userRef = await firebase.firestore().collection('users').doc(userId).get();
                console.log(userRef);
                if (userRef.exists) {
                    const userData = userRef.data();
                    if (!userData.subscribedCourses.includes(courseId)) {
                        await firebase.firestore().collection('users').doc(userId).update({
                            subscribedCourses: firebase.firestore.FieldValue.arrayUnion(courseId)
                        });
                        console.log('Course added to user successfully!');
                    } else {
                        console.log('User already has course!');
                    }
                } else {
                    console.error('User does not exist!');
                }
            } else {
                console.error('Course does not exist!');
            }
        } catch (error) {
            console.error('Error adding course to user: ', error)
        }
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
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by course name"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>
            <div className="course-list">
                {filteredCourses.map(course => (
                    <div key={course.id} className="course-card">
                        <Link to={`/courses/${course.courseId}`} className="course-card-content">
                            <h2>{course.courseName}</h2>
                            <p>{course.instructor}</p>
                        </Link>
                        <div className="subscribe-icon">
                            <FontAwesomeIcon
                                icon={faBell}
                                style={{
                                    fontSize: "18px",
                                    color: "#555555"
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            {localStorage.getItem('accountType') === 'admin' && (
                <div>
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
                    <div className='add-user-to-course'>
                        <h2>Add User to Course</h2>
                        <form onSubmit={handleSubmitAdd} className="course-form">
                            <label htmlFor="courseId" className="form-label">CourseId:</label>
                            <input
                                type="text"
                                id="courseId"
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                required
                                className="form-input"
                            />
                            <label htmlFor="userId" className="form-label">User Id:</label>
                            <input
                                type="text"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                required
                                className="form-input"
                            />
                            <button type="submit" className="submit-button">Add Course</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Courses;
