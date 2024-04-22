import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { auth, firestore } from '../firebase';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import '../css/Course.css';
import io from 'socket.io-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

function Course(props) {
    const socket = io.connect('http://localhost:3000')
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [isAlertSet, setIsAlertSet] = useState(false);
    const [hasCourse, setHasCourse] = useState(false);

    // check if the user has the courseId in their courses array
    useEffect(() => {
        const checkCourse = async () => {
            try {
                const userDoc = await firebase.firestore().collection('users').doc(auth.currentUser.uid).get();
                const userData = userDoc.data();
                console.log(userData);
                console.log(userData.subscribedCourses);
                console.log(props.courseId);
                if (userData.subscribedCourses && userData.subscribedCourses.includes(props.courseId)) {
                    setHasCourse(true);
                } else {
                    console.log('User does not have this course');
                    setHasCourse(false);
                }
            } catch (error) {
                console.error('Error fetching user data: ', error);
            }
        };

        checkCourse();
    }, [auth.currentUser.uid, props.courseId]);

    useEffect(() => {
        // Fetch existing reviews for the current course from Firestore
        const fetchReviews = async () => {
            try {
                const reviewsSnapshot = await firebase.firestore().collection('reviews')
                    .where('courseId', '==', props.courseId)
                    .get();
                const reviewsData = reviewsSnapshot.docs.map(doc => doc.data());
                setReviews(reviewsData);
            } catch (error) {
                console.error('Error fetching reviews: ', error);
            }
        };

        fetchReviews();
    }, [props.courseId]);

    useEffect(() => {
        const checkCourseAlert = async () => {
            try {
                const userDoc = await firebase.firestore().collection('users').doc(auth.currentUser.uid).get();
                const userData = userDoc.data();
                if (userData.courseAlerts && userData.courseAlerts.includes(props.courseId)) {
                    setIsAlertSet(true);
                } else {
                    setIsAlertSet(false);
                }
            } catch (error) {
                console.error('Error fetching user data: ', error);
            }
        };

        checkCourseAlert();
    }, [auth.currentUser.uid, props.courseId]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        // Create a new review object
        const newReviewData = {
            courseId: props.courseId,
            review: newReview,
            userId: auth.currentUser.uid,
        };

        // Emit the new review event to the server
        socket.emit('newReview', newReviewData);

        try {
            // Add the new review to Firestore under the 'reviews' collection
            await firebase.firestore().collection('reviews').add(newReviewData);
            console.log('Review added successfully!');

            // Update the list of reviews
            setReviews(prevReviews => [...prevReviews, newReviewData]);
        } catch (error) {
            console.error('Error adding review: ', error);
        }

        // Reset review input
        setNewReview('');
    };

    const handleDeleteReviews = async () => {
        try {
            // Delete all reviews from the 'reviews' collection in Firestore
            const querySnapshot = await firebase.firestore().collection('reviews').get();
            const batch = firebase.firestore().batch();
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log('All reviews deleted successfully!');
            // Update the reviews state to an empty array
            setReviews([]);
        } catch (error) {
            console.error('Error deleting reviews: ', error);
        }
    };

    const handleSetAlert = async () => {
        try {
            const userRef = firebase.firestore().collection('users').doc(auth.currentUser.uid);
            await userRef.update({
                courseAlerts: firebase.firestore.FieldValue.arrayUnion(props.courseId)
            });
            setIsAlertSet(true);
            console.log('Course alert set successfully!');
        } catch (error) {
            console.error('Error setting course alert: ', error);
        }
    };

    const handleRemoveAlert = async () => {
        try {
            const userRef = firebase.firestore().collection('users').doc(auth.currentUser.uid);
            await userRef.update({
                courseAlerts: firebase.firestore.FieldValue.arrayRemove(props.courseId)
            });
            setIsAlertSet(false);
            console.log('Course alert removed successfully!');
        } catch (error) {
            console.error('Error removing course alert: ', error);
        }
    };

    return (
        <>
            <div>
                View Chatroom
            </div>
            {hasCourse && (
                <div className="course-container">
                    {localStorage.getItem('accountType') === 'professor' && (
                        <div>
                            <h1>Course Reviews</h1>
                            <div className="reviews-list">
                                {reviews.map((review, index) => (
                                    <div key={index} className="review">
                                        <p>{review.review}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {localStorage.getItem('accountType') === 'student' && (
                        <div className="add-review">
                            <h2>Add Review</h2>
                            <form onSubmit={handleSubmitReview} className="review-form">
                                <label htmlFor="newReview" className="form-label">Your Review:</label>
                                <textarea
                                    id="newReview"
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                    required
                                    className="form-input"
                                />
                                <button type="submit" className="submit-button">Submit Review</button>
                            </form>
                        </div>
                    )}
                    <button onClick={handleDeleteReviews} className="delete-reviews-button">Delete All Reviews</button>
                    {isAlertSet ? (
                        <button onClick={handleRemoveAlert} className="remove-alert-button">Remove from Alerts</button>
                    ) : (
                        <button onClick={handleSetAlert} className="set-alert-button"><FontAwesomeIcon icon={faBell} /> Set Alert</button>
                    )}
                </div>
            )}
        </>
    );
}

export default Course;
