import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Button, IconButton } from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import DeleteIcon from '@mui/icons-material/Delete';

const InvoiceWidget = ({ selectedAddress }) => {
    const [invoices, setInvoices] = useState([]);
    const [visibleInvoices, setVisibleInvoices] = useState(3);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await fetch('http://localhost:8000/parking-invoice/by-lot/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    },
                    body: JSON.stringify({ selectedAddress })
                });

                const data = await response.json();
                setInvoices(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching invoices:', error);
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [selectedAddress]);

    const loadMore = () => {
        setVisibleInvoices(visibleInvoices + 3);
    };

    const handleDelete = async (invoice) => {
        try {
            await fetch(`http://localhost:8000/parking-invoice/delete/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    parking_lot: selectedAddress,
                    timestamp: invoice.timestamp,
                    license_plate: invoice.license_plate
                })
            });
            setInvoices(invoices.filter(i => i !== invoice));
        } catch (error) {
            console.error('Error deleting invoice:', error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    const calculateFinalCost = (timestamp, hourlyPrice) => {
        const now = new Date();
        const start = new Date(timestamp);
        const hoursSpent = Math.ceil((now - start) / (1000 * 60 * 60));
        return (hoursSpent * hourlyPrice).toFixed(2);
    };

    return (
        <Box>
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
                {invoices.slice(0, visibleInvoices).map((invoice) => (
                    <Card key={invoice.license_plate + invoice.timestamp} sx={{
                        minWidth: 280,
                        minHeight: 250,
                        backgroundColor: '#ffffff',
                        boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        margin: '10px',
                        padding: '10px',
                        transition: 'transform 0.3s ease-in-out',
                        position: 'relative',
                        '&:hover': {
                            boxShadow: '2px 10px 15px rgba(0,0,0,0.3)',
                            transform: 'scale(1.05)'
                        }
                    }}>
                        <IconButton
                            sx={{ position: 'absolute', top: 0, left: 0 }}
                            onClick={() => handleDelete(invoice)}
                        >
                            <DeleteIcon />
                        </IconButton>
                        <CardContent sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            textAlign: 'center',
                            width: '100%'
                        }}>
                            <Typography sx={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 1 }} gutterBottom>
                                License Plate: {invoice.license_plate}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ color: '#555', marginBottom: 1 }}>
                                Timestamp: {new Date(invoice.timestamp).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ color: '#555', marginBottom: 1 }}>
                                Hourly Price: ${invoice.hourly_price}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ color: '#555', marginBottom: 1 }}>
                                Time Spent: {Math.ceil((new Date() - new Date(invoice.timestamp)) / (1000 * 60 * 60))} hours
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ color: invoice.is_paid ? 'green' : 'red', fontWeight: 'bold' }}>
                                {invoice.is_paid ? 'Paid' : 'Unpaid'}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ color: '#555', marginBottom: 1 }}>
                                Final Cost: ${calculateFinalCost(invoice.timestamp, invoice.hourly_price)}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ color: invoice.reserved_time ? 'blue' : '#555', marginBottom: 1 }}>
                                Reserved: {invoice.reserved_time ? 'Yes' : 'No'}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Masonry>
            {visibleInvoices < invoices.length && (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                    <Button
                        variant="contained"
                        onClick={loadMore}
                        sx={{
                            backgroundColor: '#000',
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: '#333',
                            },
                            padding: '10px 20px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: '25px',
                        }}
                    >
                        Load More
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default InvoiceWidget;
