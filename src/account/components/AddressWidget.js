import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, IconButton, Box, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { GoogleMap, useJsApiLoader, Autocomplete, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '200px'
};

const AddressWidget = ({initialLat, initialLng, isFetchLoading}) => {
    const [map, setMap] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [address, setAddress] = useState('');
    const [selectedPlace, setSelectedPlace] = useState({lat: initialLat, lng: initialLng});

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: ['places']
    });

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleLoad = useCallback((autocomplete) => {
        const autocompleteListener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                console.error('No geometry data for the place returned.');
                return;
            }
            const location = place.geometry.location;
            map.panTo(location);
            setAddress(place.formatted_address);
            setSelectedPlace({
                lat: location.lat(),
                lng: location.lng()
            });
        });
        return () => window.google.maps.event.removeListener(autocompleteListener);
    }, [map]);

    const handleConfirm = () => {
        setEditMode(false);
        localStorage.setItem('selectedAddressOption', address);
        const url = 'http://localhost:8000/parking/address-update/';

        const requestBody = {
            token: localStorage.getItem("access_token"),
            new_latitude: selectedPlace.lat,
            new_longitude: selectedPlace.lng,
            new_address: address,
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
                    throw new Error('Failed to update address');
                }
                console.log('Adress updated successfully');
            })
            .catch(error => {
                console.error('Error updating address:', error);
            });
    };

    const handleCancel = () => {
        setEditMode(false);
    };

    useEffect(() => {
        console.log("Initial Lat, Lng:", initialLat, initialLng);
        console.log("isLoaded:", isLoaded);
        console.log("isFetchLoading:", isFetchLoading);
        if (initialLat !== null && !isFetchLoading) {
            const center = { lat: initialLat, lng: initialLng };
            setSelectedPlace(center)
        }
    }, [initialLat, initialLng, isFetchLoading, isLoaded]);

    return (
        <Card sx={{
            minWidth: 280,
            minHeight: 300,
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
            '&:hover': {
                boxShadow: '2px 10px 15px rgba(0,0,0,0.3)'
            }
        }}>
            <CardContent sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isFetchLoading? (
                    <CircularProgress />
                ) : (
                <>
                <Typography sx={{ flexGrow: 1, textAlign: 'left', fontSize: 16, fontWeight: 'medium', color: '#333' }} gutterBottom>
                    Address
                </Typography>
                <Box>
                    {editMode ? (
                        <>
                            <IconButton onClick={handleConfirm} size="small">
                                <CheckIcon />
                            </IconButton>
                            <IconButton onClick={handleCancel} size="small">
                                <CloseIcon />
                            </IconButton>
                        </>
                    ) : (
                        <IconButton onClick={handleEditClick} size="small">
                            <EditIcon />
                        </IconButton>
                    )}
                </Box>
                </>)}
            </CardContent>
            {editMode && isLoaded && !isFetchLoading && (
                <div style={{ visibility: editMode ? 'visible' : 'hidden' }}>
                    <Autocomplete onLoad={handleLoad}>
                        <TextField
                            fullWidth
                            onChange={e => setAddress(e.target.value)}
                            value={address}
                            placeholder="Search new location"
                            variant="outlined"
                            size="small"
                            sx={{ mb: 2 }}
                        />
                    </Autocomplete>
                </div>
            )}
            {isFetchLoading? (
                    <CircularProgress />
            ) : (
            <>
            {isLoaded &&(
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={selectedPlace}
                    zoom={15}
                    onLoad={map => setMap(map)}
                    options={{
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false
                    }}
                >
                    <Marker position={selectedPlace} />
                </GoogleMap>
            )}
            </>)}
        </Card>
    );
};

export default AddressWidget;
