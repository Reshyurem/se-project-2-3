import React from 'react';

const PostComponent = ({ post }) => {
    return (
        <div className="post">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <p>Posted by: {post.author}</p>
        </div>
    );
}

export default PostComponent;
