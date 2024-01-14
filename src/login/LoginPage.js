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
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const submit = async (e) => {
    e.preventDefault();

    if (showLogin) {
      // Login form
      const user = {
        username: username,
        password: password,
      };

      try {
        const { data } = await axios.post("http://127.0.0.1:8000/auth/login/", user, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        localStorage.clear();
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data["access"]}`;

        console.log(localStorage.getItem("access_token"));
        console.log(localStorage.getItem("refresh_token"));
        // Redirect to home page using React Router
        navigate("/");
      } catch (error) {
        console.error("Login failed:", error);
        setError("Invalid credentials. Please try again."); // Set error message
      }
    } else {
      // Signup form
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please try again.");
        return;
      }

      const user = {
        username: username,
        password: password,
      };

      try {
        // Perform signup logic here
        // ...

        // For demonstration purposes, I'm just logging the user data
        console.log("User signed up:", user);

        // You can redirect the user or perform any other actions after successful signup
      } catch (error) {
        console.error("Signup failed:", error);
        setError("Signup failed. Please try again."); // Set error message
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
            <Grid container justify="center" alignItems="center">
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
                      id="username"
                      label="Username"
                      name="username"
                      autoFocus
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="text-field"
                    />
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
