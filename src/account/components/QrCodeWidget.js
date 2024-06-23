import React, { useRef } from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { QRCodeCanvas } from 'qrcode.react';

const QrCodeWidget = ({ selectedAddress }) => {
    const qrRef = useRef(null);  // Using ref to directly access the QR code canvas

    const handlePrint = () => {
        setTimeout(() => {
            if (qrRef.current) {
                const qrImageSrc = qrRef.current.toDataURL("image/png");
    
                const qrWindow = window.open('', '_blank', 'height=500,width=500');
                qrWindow.document.write(`<html><head><title>Print QR Code</title></head><body style="display: flex; justify-content: center; align-items: center; height: 100vh;">`);
                qrWindow.document.write(`<img src="${qrImageSrc}" style="max-width: 100%; max-height: 100%;"/>`);
                qrWindow.document.write('</body></html>');
                qrWindow.document.close();
                qrWindow.focus();
                qrWindow.print();
                qrWindow.close();
            } else {
                console.error('QR Code canvas not available for printing.');
            }
        }, 500); // Delay of 500 ms before attempting to print
    };

    return (
        <Card sx={{
            minWidth: 180,
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
            <CardContent sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 18, fontWeight: 'medium' }}>
                    Easy Access
                </Typography>
                <IconButton onClick={handlePrint}>
                    <PrintIcon />
                </IconButton>
            </CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <QRCodeCanvas
                value={selectedAddress}
                size={230}
                level={"H"}
                includeMargin={true}
                ref={qrRef}
            />
            </Box>
        </Card>
    );
};

export default QrCodeWidget;