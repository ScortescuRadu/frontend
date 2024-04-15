import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, LinearProgress, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { green } from '@mui/material/colors';

const StripeViewSuccess = () => {
    const [counter, setCounter] = useState(100);  // Starting from 100 for smoother transition (100 tenths of a second)

    useEffect(() => {
        const interval = setInterval(() => {
            setCounter((prevCounter) => prevCounter - 1);
        }, 100);  // Update every tenth of a second

        if (counter <= 0) {
            clearInterval(interval);
            window.location.href = 'http://localhost:3000/stripe/';
        }

        return () => clearInterval(interval);
    }, [counter]);

    const handleImmediateRedirect = () => {
        window.location.href = 'http://localhost:3000/stripe/';  // Redirect immediately
    };

    return (
        <Box
            sx={{
                background: 'linear-gradient(180deg, #4b42f5, #00c853)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Paper elevation={0} sx={{
                width: 'auto',
                maxWidth: '480px',
                backgroundColor: '#fff',
                padding: '20px',
                boxShadow: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 60, color: green[500], mb: 2 }} />
                <Typography variant="h6" component="h1" sx={{
                    fontWeight: 'bold',
                    fontSize: '24px',
                    color: 'black',
                    textAlign: 'center',
                    paddingBottom: '20px'
                }}>
                    Payment Successful!
                </Typography>
                <Typography variant="body1" sx={{ color: green[700], mb: 1 }}>
                    Your payment has been processed successfully. Thank you for your purchase!
                </Typography>
                <Typography variant="body2" sx={{ color: green[700], mb: 2 }}>
                    Redirecting in {Math.ceil(counter / 10)} seconds...
                </Typography>
                <LinearProgress variant="determinate" value={100 - counter} sx={{ width: '100%', mb: 1 }} />
                <Button variant="outlined" onClick={handleImmediateRedirect} sx={{ mt: 2 }}>
                    Go Back Now
                </Button>
            </Paper>
        </Box>
    );
};

export default StripeViewSuccess;
