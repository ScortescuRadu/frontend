import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Card, CardContent, Container, TextField, Typography, Grid, useMediaQuery } from "@material-ui/core";
import VideoBg from './img/videoBg.mp4';
import "./styles.css"; // Import the CSS file for additional styles

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  const isSmallScreen = useMediaQuery('(max-width:900px)');

  const submit = async (e) => {
    e.preventDefault();

    if (showLogin) {
        // Login form
        const user = {
            email: email,
            password: password,
        };
    
        try {
            const response = await fetch('http://localhost:8000/account/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // credentials: 'include',
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();
            // const text = await response.text();
            console.log('User session jwt:', data);
    
            if (!response.ok) {
                // Handle non-successful responses (e.g., 4xx or 5xx status codes)
                const errorData = data;
                console.error("Login failed again:", errorData);
                setError("Invalid credentials. Please try again.");
                return;
            }

            localStorage.clear();
            localStorage.setItem("access_token", data.token);
    
            console.log(localStorage.getItem("access_token"));

            // Redirect to home page using React Router
            navigate("/");
        } catch (error) {
            console.error("Login failed:", error);
            setError("Invalid credentials. Please try again.");
        }
    } else {
            // Signup form
            if (password !== confirmPassword) {
              setError("Passwords do not match. Please try again.");
              return;
            }
        
            // Password validation: at least 8 characters
            const passwordRegex = /^.{8,}$/;
            if (!passwordRegex.test(password)) {
              setError("Password must have at least 8 characters.");
              return;
            }
        
            const user = {
              username: username,
              email: email,
              password: password,
            };
        
            try {
              const response = await axios.post("http://127.0.0.1:8000/account/register", user, {
                headers: {
                  "Content-Type": "application/json",
                },
              });
        
              // Successful signup
              console.log("User signed up:", response.data);
              // You can redirect the user or perform any other actions after successful signup
        
            } catch (error) {
              console.error("Signup failed:", error);
              console.error('data', user)
        
              if (error.response && error.response.status === 400) {
                // Bad request (validation error)
                setError(error.response.data.detail);
              } else {
                // Other errors
                setError("Signup failed. Please try again.");
              }
            }
    }
  };

  const switchToSignup = () => {
    setShowLogin(false);
  };

  const switchToLogin = () => {
    setShowLogin(true);
  };

  return (
    <div className="main-div">
      <video className="video-bg" autoPlay loop muted>
        <source src={VideoBg} type="video/mp4" />
      </video>
      <div className="overlay">
        <Container component="main" maxWidth="md">
          <Card className={`auth-card ${isSmallScreen ? 'small-screen' : ''}`}>
            <Grid container alignItems="center">
              <Grid item xs={12} sm={6}>
                <img
                  src="https://33.media.tumblr.com/6bcdef3843973653c1846203d188eea9/tumblr_nl6mqsjd5w1s4fz4bo1_500.gif"
                  alt="Login"
                  className="login-image"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CardContent>
                  <Typography component="h1" variant="h5" align="center">
                    {showLogin ? "Sign In" : "Sign Up"}
                  </Typography>
                  <form onSubmit={submit}>
                    <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="text-field"
                    />
                    {showLogin ? null : (
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="text-field"
                        />
                    )}
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="text-field"
                    />
                    {showLogin ? null : (
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="text-field"
                      />
                    )}
                    {error && (
                      <Typography variant="body2" color="error" style={{ marginBottom: "1rem" }}>
                        {error}
                      </Typography>
                    )}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      className="submit-button"
                    >
                      {showLogin ? "Sign In" : "Sign Up"}
                    </Button>
                  </form>
                  <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    {showLogin ? (
                      <Typography variant="body2">
                        Don't have an account?{" "}
                        <span style={{ cursor: "pointer", color: "#4CAF50" }} onClick={switchToSignup}>
                          Sign Up
                        </span>
                      </Typography>
                    ) : (
                      <Typography variant="body2">
                        Already have an account?{" "}
                        <span style={{ cursor: "pointer", color: "#4CAF50" }} onClick={switchToLogin}>
                          Sign In
                        </span>
                      </Typography>
                    )}
                  </div>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default Login;
