import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { red } from '@mui/material/colors';
import { useLocation, useNavigate } from 'react-router-dom';

const StripeViewFailure = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const license = queryParams.get('license');
    const spot = queryParams.get('spot');
    const timestamp = queryParams.get('timestamp');

    const handleRetry = () => {
        const retryURL = `/stripe?license=${encodeURIComponent(license)}&spot=${encodeURIComponent(spot)}&timestamp=${encodeURIComponent(timestamp)}`;
        navigate(retryURL);
    };

    return (
        <Box
            sx={{
                background: 'linear-gradient(180deg, #4b42f5, #eb4034)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Paper elevation={0} sx={{
                width: 'auto',
                maxWidth: '480px',
                backgroundColor: '#fff', // White background
                padding: '20px',
                boxShadow: 'none', // Remove any shadow for a flat design characteristic of Brutalism
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <ErrorOutlineIcon sx={{ fontSize: 60, color: red[500], mb: 2 }} />
                <Typography variant="h6" component="h1" sx={{
                    fontWeight: 'bold',
                    fontSize: '24px',
                    color: 'black',
                    textAlign: 'center',
                    paddingBottom: '20px'
                }}>
                    Payment Failure
                </Typography>
                <Typography variant="body1" sx={{ color: red[700], mb: 3 }}>
                    There was a problem processing your payment. Please try again.
                </Typography>
                <Button variant="contained" color="error" onClick={handleRetry} sx={{ fontWeight: 'bold' }}>
                    Retry Payment
                </Button>
            </Paper>
        </Box>
    );
};

export default StripeViewFailure;
