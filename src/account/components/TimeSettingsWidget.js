import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, IconButton, Grid, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const TimeSettingsWidget = () => {
    const initialTimes = {
        weekdayOpening: '09:00',
        weekdayClosing: '17:00',
        weekendOpening: '10:00',
        weekendClosing: '14:00'
    };

    const [editMode, setEditMode] = useState(false);
    const [times, setTimes] = useState(initialTimes);
    const [originalTimes, setOriginalTimes] = useState({ ...initialTimes });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setTimes(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditMode = () => {
        setOriginalTimes({ ...times });
        setEditMode(true);
    };

    const handleSave = () => {
        setEditMode(false);
        // Here you would send the updated times to the API
        console.log('Saving new times:', times);
    };

    const handleCancel = () => {
        // Reset changes by re-fetching or undoing local edits if not yet saved
        // For simplicity, we will not implement this in this example
        setTimes(originalTimes);
        setEditMode(false);
    };

    const TimeDisplay = ({ time, label }) => (
        <Typography variant="body1" sx={{ marginY: 1 }}>
            {label}: {time}
        </Typography>
    );

    const TimeInput = ({ time, label, name }) => (
        <TextField
            label={label}
            type="time"
            name={name}
            value={time}
            onChange={handleChange}
            InputLabelProps={{
                shrink: true,
            }}
            inputProps={{
                step: 300, // 5 minutes
            }}
            sx={{ width: '100%', marginY: 1 }}
        />
    );

    return (
        <Card sx={{
            minWidth: 280,
            backgroundColor: '#ffffff',
            boxShadow: '2px 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '20px',
            padding: '20px',
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
                boxShadow: '2px 10px 20px rgba(0,0,0,0.2)'
            }
        }}>
            <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 'bold', color: '#333' }} gutterBottom>
                        Operating Hours
                    </Typography>
                    {!editMode ? (
                        <IconButton onClick={handleEditMode} color="primary">
                            <EditIcon />
                        </IconButton>
                    ) : (
                        <div>
                            <IconButton onClick={handleSave} color="primary">
                                <CheckIcon />
                            </IconButton>
                            <IconButton onClick={handleCancel} color="secondary">
                                <CloseIcon />
                            </IconButton>
                        </div>
                    )}
                </div>
                <Divider sx={{ width: '100%', marginBottom: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Weekdays</Typography>
                        {!editMode ? (
                            <>
                                <TimeDisplay time={times.weekdayOpening} label="Opening" />
                                <TimeDisplay time={times.weekdayClosing} label="Closing" />
                            </>
                        ) : (
                            <>
                                <TimeInput time={times.weekdayOpening} label="Opening Time" name="weekdayOpening" />
                                <TimeInput time={times.weekdayClosing} label="Closing Time" name="weekdayClosing" />
                            </>
                        )}
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Weekends</Typography>
                        {!editMode ? (
                            <>
                                <TimeDisplay time={times.weekendOpening} label="Opening" />
                                <TimeDisplay time={times.weekendClosing} label="Closing" />
                            </>
                        ) : (
                            <>
                                <TimeInput time={times.weekendOpening} label="Opening Time" name="weekendOpening" />
                                <TimeInput time={times.weekendClosing} label="Closing Time" name="weekendClosing" />
                            </>
                        )}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default TimeSettingsWidget;
