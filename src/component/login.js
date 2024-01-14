import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Card, CardContent, Container, TextField, Typography, Grid } from "@material-ui/core";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();

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
    }
  };

  return (
<Container component="main" maxWidth="xs">
      <Card>
        <Grid container>
          {/* Display image on larger screens */}
          <Grid item xs={12} sm={6}>
            <img src="/path/to/your/image.jpg" alt="Login" style={{ width: "100%", height: "auto" }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardContent>
              <Typography component="h1" variant="h5" align="center">
                Sign In
              </Typography>
              <form onSubmit={submit}>
                {/* Your existing form code */}
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
                />
                <Button type="submit" fullWidth variant="contained" color="primary">
                  Submit
                </Button>
              </form>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default Login;
