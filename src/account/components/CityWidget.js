import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const CityCardWidget = ({ cityName }) => {
    return (
        <Card sx={{
            minWidth: 280,
            minHeight: 250,
            backgroundImage: `url(https://media.digitalnomads.world/wp-content/uploads/2021/11/20114741/Timisoara-digital-nomads.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            border: '1px solid #333',
            borderRadius: '8px',
            margin: '10px',
            overflow: 'hidden',
            position: 'relative',
            '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))'
            },
            '&:hover': {
                boxShadow: '2px 10px 15px rgba(0,0,0,0.3)'
            }
        }}>
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)', // Dark overlay for better readability
                display: 'flex',
                alignItems: 'flex-end', // Position title at the bottom
                justifyContent: 'center', // Center title horizontally
                padding: '20px'
            }}>
                <Typography variant="h4" component="div" sx={{
                    fontWeight: 700, // Uber-like boldness
                    fontSize: '2.5rem', // Larger font size
                    letterSpacing: '0.05em', // Add some letter spacing
                    color: '#fff',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Text shadow for depth
                    padding: '5px 15px', // Padding around the text
                    borderRadius: '5px', // Rounded corners around the text
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background for the text
                    display: 'inline', // Only take up necessary space
                }}>
                    {cityName}
                </Typography>
            </Box>
        </Card>
    );
};

export default CityCardWidget;
