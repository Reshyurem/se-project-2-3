import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'; // Axios for HTTP requests
import '../css/Courses.css';

function Courses() {
    const [courses, setCourses] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [instructor, setInstructor] = useState('');
    const [currentUser, setCurrentUser] = useState(null); // Replace currentUserDoc with currentUser
    const [subscribedCourses, setSubscribedCourses] = useState([]);
    const [rerenderKey, setRerenderKey] = useState(0);

    const microserviceBaseURL = 'http://localhost:8000'; // Your FastAPI microservice base URL

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
            if(currentUserDoc) {
                const action = isSubscribed(courseId) ? 'unsubscribe' : 'subscribe';
                // if (isSubscribed(courseId)) {
                //     await currentUserDoc.ref.update({
                //         subscribedCourses: firebase.firestore.FieldValue.arrayRemove(courseId)
                //     });
                // } else {
                //     await currentUserDoc.ref.update({
                //         subscribedCourses: firebase.firestore.FieldValue.arrayUnion(courseId)
                //     });
                // }
                await axios.post(`${microserviceBaseURL}/subscribe`, {
                    userId,
                    courseId,
                    action
                });
                console.log(action + ' to course successfully!');
                // Update the rerender key to trigger a re-render
                setRerenderKey(prevKey => prevKey + 1);
            }
        } catch (error) {
            console.error(`Error subscribing to course:`, error);
        }
    };

    return (
        <div className="courses-container">
            <h1>All Courses</h1>
            <div className="course-list">
                {courses.map((course) => (
                    <div key={course.id} className="course-card">
                        <Link to={`/courses/${course.courseId}`} className="course-card-content">
                            <h2>{course.courseName}</h2>
                            <p>{course.instructor}</p>
                        </Link>
                        <div className="subscribe-icon" onClick={() => handleSubscribe(course.courseId)}>
                            <FontAwesomeIcon
                                icon={faBell}
                                style={{
                                    fontSize: '18px',
                                    color: isSubscribed(course.courseId) ? 'yellow' : '#555555',
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="add-course">
                <h2>Add Course</h2>
                <form onSubmit={handleSubmit} className="course-form">
                    <label htmlFor="courseName" className="form-label">
                        Course Name:
                    </label>
                    <input
                        type="text"
                        id="courseName"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        required
                        className="form-input"
                    />
                    <label htmlFor="instructor" className="form-label">
                        Instructor:
                    </label>
                    <input
                        type="text"
                        id="instructor"
                        value={instructor}
                        onChange={(e) => setInstructor(e.target.value)}
                        required
                        className="form-input"
                    />
                    <button type='submit' className='submit-button'>
                        Add Course
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Courses;
