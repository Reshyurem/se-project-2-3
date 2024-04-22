import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { auth, firestore } from '../firebase';
import '../css/Forum.css';

function DiscussionForum(props) {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [newPostTitle, setNewPostTitle] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [showNewPostForm, setShowNewPostForm] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState({});

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const courseQuerySnapshot = await firestore.collection('courses').where('courseId', '==', props.courseId).get();
    
                if (courseQuerySnapshot.empty) {
                    console.error(`No course found with courseId ${props.courseId}`);
                    return;
                }
    
                const courseIdDocId = courseQuerySnapshot.docs[0].id;
    
                const postsSnapshot = await firestore
                    .collection(`/courses/${courseIdDocId}/posts`)
                    .get();
                const postsData = postsSnapshot.docs.map(doc => {
                    const post = doc.data();
                    post.id = doc.id; // Assigning the document ID as post ID
                    return post;
                });
    
                setPosts(postsData);
            } catch (error) {
                console.error('Error fetching posts: ', error);
            }
        };
    
        fetchPosts();
    }, [props.courseId]);
    

    const handleNewPostChange = (event) => {
        setNewPost(event.target.value);
    };

    const handleNewPostTitleChange = (event) => {
        setNewPostTitle(event.target.value);
    };


    const handleNewPostSubmit = async (event) => {
        event.preventDefault();
        
        try {
            const courseQuerySnapshot = await firestore.collection('courses').where('courseId', '==', props.courseId).get();
            
            if (courseQuerySnapshot.empty) {
                console.error(`No course found with courseId ${props.courseId}`);
                return;
            }
            
            const courseIdDocId = courseQuerySnapshot.docs[0].id;
            
            // Create the new post data
            const newPostData = {
                title: newPostTitle,
                content: newPost,
                author: auth.currentUser.displayName,
                courseId: props.courseId,
                replies: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp() // Include server timestamp
            };
            
            const newPostRef = await firestore
                .collection(`/courses/${courseIdDocId}/posts`)
                .add(newPostData); // Firestore generates a unique ID
            console.log('Post added successfully!');
            
            setPosts((prevPosts) => [
                ...prevPosts,
                { ...newPostData, id: newPostRef.id }, // Assigning the document ID as post ID
            ]);
            
            setNewPost('');
            setNewPostTitle('');
            setShowNewPostForm(false); // Hide the new post form after submission
        } catch (error) {
            console.error('Error adding new post: ', error);
        }
    };


    const handleReplySubmit = async (postId, replyContent) => {
        try {
            const courseQuerySnapshot = await firestore.collection('courses').where('courseId', '==', props.courseId).get();
    
            if (courseQuerySnapshot.empty) {
                console.error(`No course found with courseId ${props.courseId}`);
                return;
            }
    
            const courseIdDocId = courseQuerySnapshot.docs[0].id;
    
            const replyData = {
                content: replyContent,
                author: auth.currentUser.displayName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp() // Include server timestamp
            };
    
            const replyRef = await firestore
                .collection(`/courses/${courseIdDocId}/posts`)
                .doc(postId)
                .collection('replies')
                .add(replyData); // Firestore generates a unique ID for the reply
            console.log('Reply added successfully!');
            
            const updatedPosts = posts.map((post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        replies: [...post.replies, { ...replyData, id: replyRef.id }], // Assigning the document ID as reply ID
                    };
                }
                return post;
            });
            setPosts(updatedPosts);
    
            // Hide the reply form after submission and clear reply content
            setShowReplyForm({ ...showReplyForm, [postId]: false });
            setReplyContent('');
        } catch (error) {
            console.error('Error adding reply: ', error);
        }
    };
    

    const toggleNewPostForm = () => {
        setShowNewPostForm(!showNewPostForm);
    };

    const toggleReplyForm = (postId) => {
        setShowReplyForm({ ...showReplyForm, [postId]: !showReplyForm[postId] });
    };  

    const getReplies = async (postId) => {
        try {
            const courseQuerySnapshot = await firestore.collection('courses').where('courseId', '==', props.courseId).get();
    
            if (courseQuerySnapshot.empty) {
                console.error(`No course found with courseId ${props.courseId}`);
                return;
            }
    
            const courseIdDocId = courseQuerySnapshot.docs[0].id;
    
            const repliesSnapshot = await firestore.collection(`/courses/${courseIdDocId}/posts/${postId}/replies`).get();
    
            const repliesData = repliesSnapshot.docs.map(doc => {
                const reply = doc.data();
                reply.id = doc.id;
                return reply;
            });
    
            // Return the replies data
            return repliesData;
        } catch (error) {
            console.error('Error fetching replies: ', error);
            return []; // Return an empty array if there's an error
        }
    };

    const renderReplies = (postId,replies) => {
        try {
            // const replies = await getReplies(postId);
            console.log(replies)
            console.log("******")
            console.log(postId);
    
            return (
                <div className="replies">
                    <h4>Replies:</h4>
                    {replies && replies.length > 0 ? (
                        replies.map((reply, index) => (
                            <div key={index} className="reply">
                                <p>{reply.content}</p>
                                <p>Posted on: {new Date(reply.createdAt.seconds * 1000).toLocaleString()}</p>
    
                                <button onClick={() => toggleReplyForm(reply.id)}>
                                    {showReplyForm[reply.id] ? 'Cancel Reply' : 'Reply'}
                                </button>
                                {showReplyForm[reply.id] && (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleReplySubmit(reply.id, replyContent);
                                        }}
                                    >
                                        <input
                                            type="text"
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            required
                                        />
                                        <button type="submit">Submit Reply</button>
                                    </form>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No replies yet.</p>
                    )}
                </div>
            );
        } catch (error) {
            console.error('Error rendering replies: ', error);
            return null; // Return null or a fallback UI if there's an error
        }
    };
    

    return (
        <div className="discussion-forum">
            <h2>Discussion Forum</h2>
            <button onClick={toggleNewPostForm}>
                {showNewPostForm ? 'Cancel Add Post' : 'Add Post'}
            </button>
            {showNewPostForm && (
                <form onSubmit={handleNewPostSubmit}>
                    <label htmlFor="newPostTitle">Post Title:</label>
                    <input
                        type="text"
                        id="newPostTitle"
                        value={newPostTitle}
                        onChange={handleNewPostTitleChange}
                        required
                    />
                    <label htmlFor="newPost">New Post:</label>
                    <textarea
                        id="newPost"
                        value={newPost}
                        onChange={handleNewPostChange}
                        required
                    />
                    <button type="submit">Submit</button>
                </form>
            )}
            <div className="posts">
                {posts.map((post) => (
                    <div key={post.id} className="post">
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                        <p>Posted by: {post.author}</p>
                        <p>Posted on: {new Date(post.createdAt.seconds * 1000).toLocaleString()}</p>
                        <button onClick={() => toggleReplyForm(post.id)}>
                            {showReplyForm[post.id] ? 'Cancel Reply' : 'Reply'}
                        </button>
                        {showReplyForm[post.id] && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleReplySubmit(post.id, replyContent);
                                }}
                            >
                                <input
                                    type="text"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    required
                                />
                                <button type="submit">Submit Reply</button>
                            </form>
                        )}
    
                        {renderReplies(post.id,post.replies)}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DiscussionForum;
