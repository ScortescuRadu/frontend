import React, { useState } from 'react';
import { Card, CardContent, Typography, Switch, FormControlLabel, IconButton, Dialog, DialogTitle, DialogContent, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

const OccupancyWidget = ({ dailyData, weeklyData }) => {
    const [showWeekly, setShowWeekly] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const data = showWeekly ? weeklyData : dailyData;

    const barColor = (percent) => {
        if (percent < 33) return '#3498db';
        if (percent < 66) return '#f39c12';
        return '#e74c3c';
    };

    const handleToggleModal = () => {
        setOpenModal(!openModal);
    };

    return (
        <Card sx={{
            minWidth: 280,
            minHeight: 300,
            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            border: '1px solid #333',
            borderRadius: '8px',
            margin: '10px',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <CardContent sx={{ width: '100%' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ marginBottom: 2 }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 'medium' }}>
                        Occupancy Levels
                    </Typography>
                    <IconButton onClick={handleToggleModal} size="small">
                        <FullscreenIcon />
                    </IconButton>
                </Box>
                <FormControlLabel
                    control={<Switch checked={showWeekly} onChange={(e) => setShowWeekly(e.target.checked)} />}
                    label={showWeekly ? "Weekly View" : "Daily View"}
                    sx={{ marginBottom: 2 }}
                />
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="occupancy" fill={(entry) => barColor(entry.value)} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>

            {/* Modal Dialog */}
            <Dialog open={openModal} onClose={handleToggleModal} aria-labelledby="modal-title">
                <DialogTitle id="modal-title">Detailed Occupancy View</DialogTitle>
                <DialogContent>
                    <ResponsiveContainer width="200%" height={400}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="occupancy" fill={(entry) => barColor(entry.value)} />
                        </BarChart>
                    </ResponsiveContainer>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default OccupancyWidget;
