import React, { useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const ParkingLotSVG = () => {
    // Example data structure for parking spots
    const spots = [
        { id: '1A', status: 'free' },
        { id: '1B', status: 'occupied' },
        { id: '1C', status: 'reserved' },
        // More spots can be added here
    ];

    // Function to handle click on parking spots
    const handleSpotClick = (spot) => {
        alert(`Spot ${spot.id} is currently ${spot.status}`);
    };

    // Generate SVG rectangles for each parking spot
    const renderSpots = spots.map(spot => {
        const fill = spot.status === 'occupied' ? '#e74c3c' : 
                     spot.status === 'reserved' ? '#f39c12' : '#2ecc71';

        return (
            <rect key={spot.id} x="10" y={10 + spots.indexOf(spot) * 60} width="50" height="50" 
                  fill={fill} stroke="#333" strokeWidth="2" 
                  onClick={() => handleSpotClick(spot)}
                  cursor="pointer">
                <title>{`Spot ${spot.id}`}</title>
            </rect>
        );
    });

    return (
        <Card sx={{ margin: '20px', overflow: 'visible' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Parking Lot Map
                </Typography>
                <svg width="300" height="300">
                    {renderSpots}
                </svg>
            </CardContent>
        </Card>
    );
};

export default ParkingLotSVG;
