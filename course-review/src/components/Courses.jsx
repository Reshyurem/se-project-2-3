import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, firestore } from '../firebase';
import '../css/Courses.css'; // Importing CSS file

function Courses() {
    const [courseName, setCourseName] = useState('');
    const [instructor, setInstructor] = useState('');

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
            await firebase.firestore().collection('courses').doc(courseId).set(newCourse);
            console.log('Course added successfully!');
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

    return (
        <div className="courses-container">
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
    );
}

export default Courses;
