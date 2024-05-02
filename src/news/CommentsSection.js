import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, TextField, Button, Paper, IconButton, Snackbar } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ReplyIcon from '@mui/icons-material/Reply';
import MuiAlert from '@mui/material/Alert';

const CommentsSection = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { id } = useParams();

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/comments/${id}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setComments(data.map(comment => ({
            ...comment,
            liked: false,
            disliked: false,
            likes: comment.likes || 0,
            dislikes: comment.dislikes || 0,
            replies: comment.replies.map(reply => ({
                ...reply,
                liked: false,
                disliked: false,
                likes: reply.likes || 0,
                dislikes: reply.dislikes || 0
                })) || [],
                replyText: '',
                showReply: false
            })));
        } else {
          console.error('Data is not an array:', data);
          setComments([]);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      }
    };
    fetchComments();
  }, [id]);

  const toggleLike = (index, isReply, replyIndex) => {
    setComments(prevComments => prevComments.map((comment, idx) => {
      if (idx === index) {
        if (isReply) {
          // Handling replies
          const replies = comment.replies.map((reply, idx) => {
            if (idx === replyIndex) {
              if (reply.liked) {
                return { ...reply, liked: false, likes: reply.likes - 1 };
              } else {
                return {
                  ...reply,
                  liked: true,
                  likes: reply.likes + 1,
                  disliked: false,
                  dislikes: reply.disliked ? reply.dislikes - 1 : reply.dislikes
                };
              }
            }
            return reply;
          });
          return { ...comment, replies };
        } else {
          // Handling top-level comments
          if (comment.liked) {
            return { ...comment, liked: false, likes: comment.likes - 1 };
          } else {
            return {
              ...comment,
              liked: true,
              likes: comment.likes + 1,
              disliked: false,
              dislikes: comment.disliked ? comment.dislikes - 1 : comment.dislikes
            };
          }
        }
      }
      return comment;
    }));
  };
  
  const toggleDislike = (index, isReply, replyIndex) => {
    setComments(prevComments => prevComments.map((comment, idx) => {
      if (idx === index) {
        if (isReply) {
          // Handling replies
          const replies = comment.replies.map((reply, idx) => {
            if (idx === replyIndex) {
              if (reply.disliked) {
                return { ...reply, disliked: false, dislikes: reply.dislikes - 1 };
              } else {
                return {
                  ...reply,
                  disliked: true,
                  dislikes: reply.dislikes + 1,
                  liked: false,
                  likes: reply.liked ? reply.likes - 1 : reply.likes
                };
              }
            }
            return reply;
          });
          return { ...comment, replies };
        } else {
          // Handling top-level comments
          if (comment.disliked) {
            return { ...comment, disliked: false, dislikes: comment.dislikes - 1 };
          } else {
            return {
              ...comment,
              disliked: true,
              dislikes: comment.dislikes + 1,
              liked: false,
              likes: comment.liked ? comment.likes - 1 : comment.likes
            };
          }
        }
      }
      return comment;
    }));
  };

  const postComment = async () => {
    console.log('Posting comment');
    const commentData = {
        text: newComment,
        articleId: id,
        username: "CurrentUser",
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        replies: []
    };
    if (newComment !== ""){
        setComments(prevComments => [...prevComments, commentData]);
        setNewComment("");
        try {
            const response = await fetch(`http://127.0.0.1:8000/comments/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData),
            });
    
            if (!response.ok) {
                throw new Error('Failed to post comment');
              }
              // Optionally update or confirm the comment data here if needed
            } catch (error) {
              console.error('Failed to post comment:', error);
              setSnackbarMessage("Failed to post comment.");
              setSnackbarOpen(true);
              // Revert optimistic update
            //   setComments(prevComments => prevComments.filter(c => c.id !== commentData.id));
            }
    } else {
        setSnackbarMessage("Cannot post empty comment.");
        setSnackbarOpen(true);
    }
    };

    const toggleReplyInput = (index) => {
        const updatedComments = comments.map((comment, idx) => idx === index ? {...comment, showReply: !comment.showReply} : comment);
        setComments(updatedComments);
    };

  const handleReplyChange = (text, index) => {
    const updatedComments = comments.map((comment, idx) => idx === index ? {...comment, replyText: text} : comment);
    setComments(updatedComments);
  };

  const postReply = async (index) => {
    console.log('replying');
    const comment = comments[index];
  
    if (!comment.replyText.trim()) {
      setSnackbarMessage("Reply cannot be empty.");
      setSnackbarOpen(true);
      return;
    }
  
    const newReply = {
        username: "CurrentUser",
        text: comment.replyText,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        liked: false,
        disliked: false 
    };
  
    // Optimistic update
    setComments(prevComments => prevComments.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          replies: [...item.replies, newReply],
          replyText: '',
          showReply: false
        };
      }
      return item;
    }));
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/comments/reply`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ text: comment.replyText, commentId: comment.id })
      });
      if (!response.ok) {
        throw new Error('Failed to post reply');
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
    //   setSnackbarMessage("Failed to post reply: " + error.message);
    //   setSnackbarOpen(true);
    //   // Revert optimistic update
    //   setComments(prevComments => prevComments.map((item, idx) => {
    //     if (idx === index) {
    //       return {
    //         ...item,
    //         replies: item.replies.slice(0, -1)  // Remove the last reply
    //       };
    //     }
    //     return item;
    //   }));
    }
  };

  return (
    <Paper style={{ padding: '20px', marginTop: '20px' }}>
      <Typography variant="h6">Comments</Typography>
      <TextField
        fullWidth
        label="Write a comment"
        value={newComment}
        onChange={(event) => setNewComment(event.target.value)}
        variant="outlined"
        style={{ marginBottom: '20px' }}
      />
      <Button onClick={postComment} variant="contained" color="primary">
        Post Comment
      </Button>
      {comments && comments.map((comment, index) => (
        <Paper key={index} style={{ padding: '20px', margin: '20px 0', background: '#f0f0f0' }}>
          <Typography variant="subtitle2">{comment.username} - {new Date(comment.timestamp).toLocaleString()}</Typography>
          <Typography paragraph>{comment.text}</Typography>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconButton onClick={() => toggleLike(index, false)} color={comment.liked ? "primary" : "default"}>
              <ThumbUpIcon />
            </IconButton>
            <span>{comment.likes}</span>
            <IconButton onClick={() => toggleDislike(index, false)} color={comment.disliked ? "secondary" : "default"}>
              <ThumbDownIcon />
            </IconButton>
            <span>{comment.dislikes}</span>
            <IconButton onClick={() => toggleReplyInput(index)}>
              <ReplyIcon />
            </IconButton>
          </div>
          {comment.showReply && (
            <>
              <TextField
                fullWidth
                label="Write a reply"
                value={comment.replyText}
                onChange={(e) => handleReplyChange(e.target.value, index)}
                variant="outlined"
                style={{ marginBottom: '10px' }}
              />
              <Button onClick={() => postReply(index)} color="primary">
                Post Reply
              </Button>
            </>
          )}
          {comment.replies.map((reply, replyIdx) => (
            <Paper key={replyIdx} style={{ marginLeft: '40px', padding: '10px', background: '#e0e0e0' }}>
              <Typography>{reply.username} - {new Date(reply.timestamp).toLocaleString()}</Typography>
              <Typography style={{ marginTop: '5px' }}>{reply.text}</Typography>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton onClick={() => toggleLike(index, true, replyIdx)} color={reply.liked ? "primary" : "default"}>
                  <ThumbUpIcon />
                </IconButton>
                <span>{reply.likes}</span>
                <IconButton onClick={() => toggleDislike(index, true, replyIdx)} color={reply.disliked ? "secondary" : "default"}>
                  <ThumbDownIcon />
                </IconButton>
                <span>{reply.dislikes}</span>
              </div>
            </Paper>
          ))}
        </Paper>
      ))}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <MuiAlert onClose={handleSnackbarClose} severity="error" elevation={6} variant="filled">
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Paper>
  );
};

export default CommentsSection;
