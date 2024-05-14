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

const AddressWidget = ({ initialLat, initialLng, isFetchLoading, initialAddress }) => {
    const [map, setMap] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [address, setAddress] = useState(initialAddress || '');
    const [selectedPlace, setSelectedPlace] = useState({ lat: initialLat, lng: initialLng });
    const [loading, setLoading] = useState(isFetchLoading);

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
            setAddress(place.formatted_address);
            const newSelectedPlace = {
                lat: location.lat(),
                lng: location.lng()
            };
            setSelectedPlace(newSelectedPlace);
            if (map) {
                map.panTo(newSelectedPlace);
            }
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
                console.log('Address updated successfully');
            })
            .catch(error => {
                console.error('Error updating address:', error);
            });
    };

    const handleCancel = () => {
        setEditMode(false);
        setAddress(initialAddress);
        const initialPlace = { lat: initialLat, lng: initialLng };
        setSelectedPlace(initialPlace);
        if (map) {
            map.panTo(initialPlace);
        }
    };

    useEffect(() => {
        if (initialLat !== null && !isFetchLoading) {
            const center = { lat: initialLat, lng: initialLng };
            setSelectedPlace(center);
            setLoading(false);
        } else if (initialAddress) {
            // Geocode the address
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: initialAddress }, (results, status) => {
                if (status === 'OK' && results[0].geometry) {
                    const location = results[0].geometry.location;
                    const initialPlace = { lat: location.lat(), lng: location.lng() };
                    setSelectedPlace(initialPlace);
                    if (map) {
                        map.panTo(initialPlace);
                    }
                    setLoading(false);
                } else {
                    console.error('Geocode was not successful for the following reason: ' + status);
                    setLoading(false);
                }
            });
        }
    }, [initialLat, initialLng, initialAddress, isFetchLoading]);

    useEffect(() => {
        console.log("Map isLoaded:", isLoaded);
        console.log("Loading state:", loading);
        console.log("Initial Address:", initialAddress);
        console.log("Selected Place:", selectedPlace);
    }, [isLoaded, loading, initialAddress, selectedPlace]);

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
            </CardContent>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {editMode && isLoaded && (
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
                    {isLoaded && (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={selectedPlace}
                            zoom={15}
                            onLoad={mapInstance => {
                                setMap(mapInstance);
                                mapInstance.panTo(selectedPlace);
                            }}
                            options={{
                                zoomControl: true,
                                streetViewControl: false,
                                mapTypeControl: false,
                                fullscreenControl: false
                            }}
                        >
                            <Marker
                                position={selectedPlace}
                                visible={true}
                                icon={{
                                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                                }}
                            />
                        </GoogleMap>
                    )}
                </>
            )}
        </Card>
    );
};

export default AddressWidget;
