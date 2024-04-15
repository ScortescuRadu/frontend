import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EuroIcon from './EuroIcon'; 

const InfoCard = ({ label, icon, data }) => {
    return (
        <Card sx={{
            flexGrow: 1,
            m: 1,
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)', // Adds soft shadow for depth
            borderRadius: '10px', // Rounded corners for a smoother look
            display: 'flex', // Ensures the content is laid out flexibly
            justifyContent: 'space-between', // Spreads content across the card
            alignItems: 'center', // Centers items vertically
        }}>
            <CardContent sx={{
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'center', // Centers text horizontally
                textAlign: 'center', // Ensures text is centered
            }}>
                <Box>
                    <Typography variant="subtitle2" color="textSecondary">{label}</Typography>
                    <Typography variant="h6">{data}</Typography>
                </Box>
            </CardContent>
            <Box sx={{ color: 'text.primary', mr: 2, display: 'flex', alignItems: 'center' }}>
                {React.cloneElement(icon, { style: { fontSize: '1.5rem', color: 'black' }})}
            </Box>
        </Card>
    );
};

const InvoiceDetails = ({ licensePlate, spot, timestamp, price }) => {
    return (
        <Grid container spacing={2} sx={{ p: 2, justifyContent: 'center' }}>
            <Grid item xs={12}>
                <InfoCard
                    label="License Plate"
                    icon={<DriveEtaIcon />}
                    data={licensePlate}
                />
            </Grid>
            <Grid item xs={12}>
                <InfoCard
                    label="Parking Spot"
                    icon={<PlaceIcon />}
                    data={spot}
                />
            </Grid>
            <Grid item xs={12}>
                <InfoCard
                    label="Timestamp"
                    icon={<AccessTimeIcon />}
                    data={new Date(timestamp).toLocaleString()}
                />
            </Grid>
            <Grid item xs={12}>
                <InfoCard
                    label="Price"
                    icon={<EuroIcon />}
                    data={`${price} EUR`}
                />
            </Grid>
        </Grid>
    );
};

export default InvoiceDetails;
