import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Button, Paper, IconButton, Snackbar } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ReplyIcon from '@mui/icons-material/Reply';
import MuiAlert from '@mui/material/Alert';

const CommentsSection = ({articleId}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { id } = useParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const LoginPromptModal = ({ open, onClose, onSignIn }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>You need to be logged in</DialogTitle>
            <DialogContent>
                You must sign in to perform this action. Would you like to go to the sign-in page?
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSignIn} color="primary">Sign In</Button>
            </DialogActions>
        </Dialog>
    );
  };

  useEffect(() => {
    const access_token = localStorage.getItem("access_token")
    if (access_token !== "")
    {
      setIsLoggedIn(true);
    }

    const fetchComments = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/comment/article/${articleId}/`);
        const data = await response.json();
        console.log('comments:')
        console.log(data)
        if (Array.isArray(data)) {
          const commentsWithReplies = data.reduce((acc, comment) => {
          console.log('Processing comment:', comment);
          if (comment.parent_comment) {
              const parentIndex = acc.findIndex(c => c.id === comment.parent_comment);
              if (parentIndex !== -1) {
                acc[parentIndex].replies = acc[parentIndex].replies || [];
                acc[parentIndex].replies.push({
                  ...comment,
                  liked: false,
                  disliked: false,
                });
              }
            } else {
              acc.push({
                ...comment,
                liked: false,
                disliked: false,
                replies: [],
              });
            }
            return acc;
          }, []);
          console.log('Comments with replies:', commentsWithReplies);
          setComments(commentsWithReplies);
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
  }, [id, articleId]);

  const toggleLike = async (commentId, isLiked, isReply, replyIndex) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    const url = `http://127.0.0.1:8000/comment/${commentId}/like/`;
    const payload = { like: !isLiked };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(payload)
      });
    
      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

    const data = await response.json();

    setComments(prevComments => prevComments.map((comment, idx) => {
      if (idx === commentId) {
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
    } catch (error) {
      console.error('Failed to post like:', error);
      setSnackbarMessage("Failed to post like: " + error.message);
      setSnackbarOpen(true);
    }
  };
  
  const toggleDislike= async (commentId, isDisliked, isReply, replyIndex) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    const url = `http://127.0.0.1:8000/comment/${commentId}/dislike/`;
    const payload = { dislike: !isDisliked }; // Toggle the current state

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("access_token")}` // Add your auth token if necessary
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to toggle dislike');
      }

      const data = await response.json();
      setComments(prevComments => prevComments.map((comment, idx) => {
        if (idx === commentId) {
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
    } catch (error) {
      console.error('Failed to post dislike:', error);
      setSnackbarMessage("Failed to post dislike: " + error.message);
      setSnackbarOpen(true);
    }
  };

  const postComment = async () => {
    console.log('Posting comment');
    if (!newComment.trim()) {
        setSnackbarMessage("Cannot post empty comment.");
        setSnackbarOpen(true);
        return;
    }

    const commentData = {
        content: newComment, // Adjusted from 'text' to 'content'
        article: id, // Make sure this matches your backend model
        user: "CurrentUser", // Adjust according to how user is handled
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        replies: [] // Initial empty replies array
    };

    setComments(prevComments => [...prevComments, commentData]); // Optimistic update
    setNewComment("");
    if (newComment !== ""){
        try {
          const response = await fetch(`http://127.0.0.1:8000/comment/publish/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commentData)
          });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }
            // Response handling can be adjusted based on your specific needs
        } catch (error) {
            console.error('Failed to post comment:', error);
            setSnackbarMessage("Failed to post comment.");
            setSnackbarOpen(true);
            setComments(prevComments => prevComments.slice(0, -1)); // Revert optimistic update on failure
        }
    } else {
        setSnackbarMessage("Cannot post empty comment.");
        setSnackbarOpen(true);
    }
  };

  const toggleReplyInput = (index) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    const updatedComments = comments.map((comment, idx) => idx === index ? {...comment, showReply: !comment.showReply} : comment);
    setComments(updatedComments);
  };

  const handleReplyChange = (text, index) => {
    const updatedComments = comments.map((comment, idx) => idx === index ? {...comment, replyText: text} : comment);
    setComments(updatedComments);
  };

  const postReply = async (parentIndex, index) => {
    console.log('replying');
    const replyText = comments[parentIndex].replyText;

    if (!replyText.trim()) {
      setSnackbarMessage("Reply cannot be empty.");
      setSnackbarOpen(true);
      return;
    }

    const newReply = {
      access_token: localStorage.getItem("access_token"),
      article_id: articleId,
      content: replyText,
      parent_comment: comments[parentIndex].id,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0
    };
    console.log('newReply:')
    console.log(newReply);
    // Optimistic update
    const updatedComments = comments.map((comment, idx) => {
      if (idx === parentIndex) {
          return {
              ...comment,
              replies: [...comment.replies, newReply],
              replyText: '', // Clear the reply input field
          };
      }
      return comment;
    });
    setComments(updatedComments);
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/comment/publish/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( newReply )
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
          <Typography variant="subtitle2">{comment.user} - {new Date(comment.timestamp).toLocaleString()}</Typography>
          <Typography paragraph>{comment.content}</Typography>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconButton onClick={() => toggleLike(comment.id, comment.liked, false)} color={comment.liked ? "primary" : "default"}>
              <ThumbUpIcon />
            </IconButton>
            <span>{comment.likes}</span>
            <IconButton onClick={() => toggleDislike(comment.id, comment.disliked, false)} color={comment.disliked ? "secondary" : "default"}>
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
              <Typography style={{ marginTop: '5px' }}>{reply.content}</Typography>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton onClick={() => toggleLike(reply.id, reply.liked, true)} color={reply.liked ? "primary" : "default"}>
                  <ThumbUpIcon />
                </IconButton>
                <span>{reply.likes}</span>
                <IconButton onClick={() => toggleDislike(reply.id, reply.liked, true)} color={reply.disliked ? "secondary" : "default"}>
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
      <LoginPromptModal
            open={showLoginPrompt}
            onClose={() => setShowLoginPrompt(false)}
            onSignIn={() => {
                setShowLoginPrompt(false);
                // Implement or link to your sign-in logic or redirect
                console.log("Redirect to sign-in page");
            }}
      />
    </Paper>
  );
};

export default CommentsSection;
