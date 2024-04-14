import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
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
                <Typography variant="h6" component="h1" sx={{
                    fontWeight: 'bold',
                    fontSize: '24px',
                    color: 'black',
                    textAlign: 'center',
                    paddingBottom: '20px'
                }}>
                    Secure Payment
                </Typography>
                <StripeCheckout />
            </Paper>
        </Box>
    );
};

export default StripeView;
