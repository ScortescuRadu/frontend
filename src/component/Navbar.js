// Navbar.js
import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" style={{ textDecoration: "none", color: "inherit" }}>
          Your App Name
        </Typography>
        <div style={{ marginLeft: "auto" }}>
          {location.pathname !== "/login" && !isLoggedIn && (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
          {isLoggedIn && (
            <>
              <Button color="inherit" component={Link} to="/">
                My Account
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
