import React from 'react'

import SignOut from './auth/SignOut'
import Navbar from './Navbar'

// List of enrolled courses
// CoursePage -> Reviews, AddReview, Rating
// Admin -> AddCourse

function Home() {
    return (
        <div className='home'>
            <Navbar />
            <SignOut />
        </div>
    )
}


export default Home
