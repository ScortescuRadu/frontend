import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import StripeCheckout from './components/StripeCheckout';
import './StripeView.css';

const StripeView = () => {
    return (
        <Box
            sx={{
                background: 'linear-gradient(180deg, #4b42f5, #ff8c00)',
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
                // border: '3px solid black', // Bold black border typical of Brutalist design
                boxShadow: 'none', // Remove any shadow for a flat design characteristic of Brutalism
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Typography
                    variant="h4" // Larger variant for more impact
                    component="h1"
                    sx={{
                        fontWeight: 'bold',
                        fontSize: '2.5rem', // Increase the font size for better visibility
                        color: 'primary.main', // Use theme's primary color to tie into the overall design
                        textAlign: 'center',
                        paddingTop: '20px', // Increase padding for better spacing
                        paddingBottom: '10px',
                        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)', // Optional: Background gradient
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 'auto', // Centering if needed
                        width: 'fit-content', // Fit to content width for better control
                        display: 'inline-block' // Align background with text
                    }}
                    >
                    Secure Payment
                </Typography>
                <StripeCheckout />
            </Paper>
        </Box>
    );
};

export default StripeView;
