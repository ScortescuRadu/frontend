import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';

const PhoneNumberWidget = ({ initialPhoneNumber }) => {
    const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
    const [editMode, setEditMode] = useState(false);
    const [editedPhoneNumber, setEditedPhoneNumber] = useState(initialPhoneNumber);

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleCancel = () => {
        setEditedPhoneNumber(phoneNumber);
        setEditMode(false);
    };

    const handleConfirm = () => {
        setPhoneNumber(editedPhoneNumber);
        setEditMode(false);
        // Optionally send the updated phone number to the server here
    };

    const handleChange = (event) => {
        setEditedPhoneNumber(event.target.value);
    };

    return (
        <Card sx={{
            minWidth: 180,
            minHeight: 100,
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
            '&:hover': {
                boxShadow: '2px 10px 15px rgba(0,0,0,0.3)'
            }
        }}>
            <CardContent sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                width: '100%'
            }}>
                <Typography sx={{ fontSize: 16, fontWeight: 'medium', color: '#333', marginBottom: 2 }} gutterBottom>
                    Phone Number
                </Typography>
                {!editMode ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: 20, color: '#1a1a1a' }}>
                            {phoneNumber}
                        </Typography>
                        <IconButton onClick={handleEdit}>
                            <EditIcon />
                        </IconButton>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={editedPhoneNumber}
                            onChange={handleChange}
                            sx={{ marginBottom: 2 }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button onClick={handleConfirm} variant="contained" color="primary" startIcon={<CheckIcon />}>
                                Confirm
                            </Button>
                            <Button onClick={handleCancel} variant="outlined" color="secondary" startIcon={<CancelIcon />}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PhoneNumberWidget;
