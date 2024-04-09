import React from 'react'

import SignOut from './auth/SignOut'
import Navbar from './Navbar'

// List of enrolled courses
// CoursePage -> Reviews, AddReview, Rating
// Admin -> AddCourse

function Home() {
    return (
        <div className='home'>
            <SignOut />
        </div>
    )
}


export default Home
