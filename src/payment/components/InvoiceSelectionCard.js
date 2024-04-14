import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const InvoiceSelectionCard = ({ invoice, onSelect, isSelected }) => {
    return (
        <Card
            sx={{
                my: 2,
                p: 1,
                border: isSelected ? '4px solid green' : '1px solid grey',
                cursor: 'pointer'
            }}
            onClick={() => onSelect(invoice)}
        >
            <CardContent>
                <Typography variant="h6">Price: ${invoice.final_cost}</Typography>
                <Typography variant="h6">Spot: {invoice.spot_description}</Typography>
            </CardContent>
        </Card>
    );
};

export default InvoiceSelectionCard;
