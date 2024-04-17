import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import '../css/Course.css';
import io from 'socket.io-client'
import PubSub from 'pubsub-js';


function Course(props) {
    const socket = io.connect('http://localhost:3000')
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');

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

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        // Create a new review object
        const newReviewData = {
            courseId: props.courseId,
            review: newReview
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


    return (
        <div className="course-container">
            <h1>Course Reviews</h1>
            <div className="reviews-list">
                {reviews.map((review, index) => (
                    <div key={index} className="review">
                        <p>{review.review}</p>
                    </div>
                ))}
            </div>
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
        </div>
    );
}

export default Course;
