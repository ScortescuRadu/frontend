import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, IconButton, Button, LinearProgress, Box, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';

const CapacityWidget = ({ capacity, occupied, reserved, isLoading }) => {
    const numericCapacity = Number(capacity);
    const numericOccupied = Number(occupied);
    const numericReserved = Number(reserved);

    // Initialize state with numeric values or default to zero if NaN
    const [currentCapacity, setCurrentCapacity] = useState(isNaN(numericCapacity) ? 0 : numericCapacity);
    const [editedCapacity, setEditedCapacity] = useState(isNaN(numericCapacity) ? 0 : numericCapacity);
    const [showConfirm, setShowConfirm] = useState(false);

    // Calculate percentages
    const occupiedPercentage = numericCapacity > 0 ? (numericOccupied / numericCapacity) * 100 : 0;
    const reservedPercentage = numericCapacity > 0 ? (numericReserved / numericCapacity) * 100 : 0;
    const [occupiedCapacity, setOccupiedCapacity] =
        useState(isNaN(numericCapacity) ? 0 : occupiedPercentage);
    const [reservedCapacity, setReservedCapacity] =
        useState(isNaN(numericCapacity) ? 0 : reservedPercentage);

    const handleIncrease = () => {
        const newCapacity = editedCapacity + 1;
        const newOccupiedPercentage = newCapacity > 0 ? (numericOccupied / newCapacity) * 100 : 0;
        const newReservedPercentage = newCapacity > 0 ? (numericReserved / newCapacity) * 100 : 0;    
        setEditedCapacity(newCapacity);
        setOccupiedCapacity(newOccupiedPercentage);
        setReservedCapacity(newReservedPercentage);
        setShowConfirm(true);
    };

    const handleDecrease = () => {
        const newCapacity = editedCapacity - 1;
        if (newCapacity > 0) {
            const newOccupiedPercentage = newCapacity > 0 ? (numericOccupied / newCapacity) * 100 : 0;
            const newReservedPercentage = newCapacity > 0 ? (numericReserved / newCapacity) * 100 : 0;    
            setEditedCapacity(newCapacity);
            setOccupiedCapacity(newOccupiedPercentage);
            setReservedCapacity(newReservedPercentage);
            setShowConfirm(true);
        }
    };

    const handleConfirm = () => {
        setCurrentCapacity(editedCapacity);
        setShowConfirm(false);
        console.log('Confirmed new capacity:', editedCapacity);
        const url = 'http://localhost:8000/parking/capacity-update/';

        const requestBody = {
            token: localStorage.getItem("access_token"),
            capacity: editedCapacity,
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
        setEditedCapacity(currentCapacity);
        setShowConfirm(false);
    };

    useEffect(() => {
        if (capacity !== null && !isLoading) {
            setCurrentCapacity(parseInt(capacity));
            setEditedCapacity(parseInt(capacity));
        }
    }, [capacity, isLoading]);

    return (
        <Card sx={{
            minWidth: 280,
            minHeight: 250,
            backgroundColor: '#ffffff',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            border: '1px solid #333',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
            margin: '10px',
            padding: '10px'
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
                    Maximum Capacity
                </Typography>
                <Typography variant="h5" component="div" sx={{
                    fontWeight: 'bold',
                    fontSize: 24,
                    color: '#1a1a1a',
                    marginBottom: 2
                }}>
                    {editedCapacity}
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
                {/* Progress Bars */}
                <Box sx={{ width: '100%', mt: 3 }}>
                    <Typography variant="body2">Occupied: {`${occupiedCapacity.toFixed(2)}%`}</Typography>
                    <LinearProgress variant="determinate" value={occupiedCapacity} />
                </Box>
                <Box sx={{ width: '100%', mt: 2 }}>
                    <Typography variant="body2">Reserved: {`${reservedCapacity.toFixed(2)}%`}</Typography>
                    <LinearProgress variant="determinate" value={reservedCapacity} color="secondary" />
                </Box>
                </>)}
            </CardContent>
        </Card>
    );
};

export default CapacityWidget;
