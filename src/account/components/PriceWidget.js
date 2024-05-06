import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, IconButton, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';

const PriceWidget = ({ price, isLoading }) => {
    const [currentPrice, setCurrentPrice] = useState(price);
    const [editedPrice, setEditedPrice] = useState(price);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleIncrease = () => {
        const newPrice = editedPrice + 0.1;
        setEditedPrice(newPrice);
        setShowConfirm(true);
    };

    const handleDecrease = () => {
        const newPrice = editedPrice - 0.1;
        if (newPrice >= 0) {
            setEditedPrice(newPrice);
            setShowConfirm(true);
        }
    };

    const handleConfirm = () => {
        setCurrentPrice(editedPrice);
        setShowConfirm(false);
        console.log('Confirmed new price:', editedPrice);
        const url = 'http://localhost:8000/parking/price-update/';

        const requestBody = {
            token: localStorage.getItem("access_token"),
            price: editedPrice,
            street_address: localStorage.getItem("selectedAddressOption")
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify(requestBody)
        };
        fetch(url, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update price');
                }
                console.log('Price updated successfully');
            })
            .catch(error => {
                console.error('Error updating price:', error);
            });
    };

    const handleCancel = () => {
        setEditedPrice(currentPrice);
        setShowConfirm(false);
    };

    useEffect(() => {
        if (price !== null && !isLoading) {
            setCurrentPrice(parseFloat(price));
            setEditedPrice(parseFloat(price));
        }
    }, [price, isLoading]);

    return (
        <Card sx={{
            key: {price},
            minWidth: 130,
            minHeight: 140, // Adjusted height to better fit stacked buttons
            backgroundColor: '#ffffff',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            border: '1px solid #333',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
            margin: '10px',
            padding: '10px',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
                transform: 'translateY(0px)',
                boxShadow: '2px 10px 15px rgba(0,0,0,0.3)'
            }
        }}>
            <CardContent sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'center',
                width: '100%'
            }}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                <>
                <Typography sx={{ fontSize: 16, fontWeight: 'medium', color: '#333', marginBottom: 1 }} gutterBottom>
                    Price per Hour
                </Typography>
                <Typography variant="h5" component="div" sx={{
                    fontWeight: 'bold',
                    fontSize: 24,
                    color: '#1a1a1a',
                    marginBottom: 2 // Added some margin-bottom for spacing
                }}>
                    {editedPrice !== null ? `${editedPrice.toFixed(2)} EUR` : 'Price not available'}
                </Typography>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                    <IconButton onClick={handleIncrease}>
                        <AddIcon />
                    </IconButton>
                    <IconButton onClick={handleDecrease}>
                        <RemoveIcon />
                    </IconButton>
                </div>
                {showConfirm && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 1 }}>
                        <Button onClick={handleConfirm} variant="contained" color="primary" startIcon={<CheckIcon />}>
                            Confirm
                        </Button>
                        <Button onClick={handleCancel} variant="outlined" color="secondary" startIcon={<CancelIcon />}>
                            Cancel
                        </Button>
                    </div>
                )}
                </>
                )}
            </CardContent>
        </Card>
    );
};

export default PriceWidget;
