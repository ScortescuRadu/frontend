import '@reach/combobox/styles.css';
import '../map/mapStyles.css';
import { Flex } from '@chakra-ui/react';
import { Box, Button, TextField, IconButton, Typography } from '@mui/material';
import { useJsApiLoader, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import React, {useState, useEffect, useRef} from 'react';
import { getCoordsFromAddress } from '../map/MapUtils';

const center = { lat: 45.754364, lng: 21.226750 };
const MAP_LIBRARIES = ['places']

const MiniMap = () => {
    const [map, setMap] = useState(/** @type google.maps.Map */ (null))
    const [origin, setOrigin] = useState('')
    const [markers, setMarkers] = useState([]);
    /** @type React.MutableRefObject<HTMLInputElement>  */
    const originRef = useRef()

    const handleOriginChange = () => {
        if (originRef.current) {
        setOrigin(originRef.current.value);
        }
    };

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: MAP_LIBRARIES, 
    });

    const handleSearchButtonClick = () => {
        if (isLoaded && map && originRef.current) {
            // Get coordinates for the specified address
            getCoordsFromAddress(originRef.current.value).then((coords) => {
                if (coords) {
                    // Update the map center to the specified location
                    map.panTo(coords);
                    // Create a marker for the specified location
                    const newMarker = new window.google.maps.Marker({
                        position: coords,
                        map: map,
                        title: origin,
                    });
                    // Add the new marker to the array in the state
                    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
                }
            });
        }
    };    

    const findMarkerAtPosition = (position) => {
        console.log('searching')
        for (const existingMarker of markers) {
            console.log('po')
            const markerPosition = existingMarker.getPosition();
            console.log(markerPosition.lat())
            console.log(position.lat)
            if (areCoordinatesEqual(markerPosition, position)) {
                return existingMarker;
            }
        }
        return null;
    };

    const areCoordinatesEqual = (coord1, coord2) => {
        return coord1.lat() === coord2.lat && coord1.lng() === coord2.lng;
    };
    
    const handleMapClick = (event) => {
        console.log('Handling map click...')
        if (map) {
            const clickedCoords = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            };
            console.log('clicked', clickedCoords);
    
            // Check if there is a marker at the clicked location
            const existingMarker = findMarkerAtPosition(clickedCoords);
    
            // Check if there are markers on the map
            if (existingMarker) {
                // Try to find a marker at the clicked location
                const existingMarker = findMarkerAtPosition(clickedCoords);

                if (existingMarker) {
                    console.log('Existing marker clicked');
                    // Existing marker clicked, handle it here
                    existingMarker.setMap(null);
                    setMarkers((prevMarkers) => prevMarkers.filter(marker => marker !== existingMarker));
                    return;  // Stop further execution
                }
            } else {
                console.log('creating new marker');
                // If no marker exists, create a new one
                const newMarker = new window.google.maps.Marker({
                    position: clickedCoords,
                    map: map,
                    title: `marker-${Date.now()}`, // Use a unique identifier for the title
                });
    
                // Update the array of markers in the state
                setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
            }
        }
    };    
    
    if (loadError) {
        return <div>Error loading Google Maps API</div>;
    }

    return (
        <div style={{ width: '100%', height: '500px', overflow: 'hidden', border: '2px solid black', borderRadius: '15px' }}>
        {isLoaded && (
        <Flex
            position='relative'
            flexDirection='column'
            alignItems='center'
            bgColor='blue.200'
            bgImage='https://i.pinimg.com/originals/86/cc/bb/86ccbb5469e5192dbdc7c031ca45d0c2.gif'
            bgPos='bottom'
            h='180vh'
            w='100vw'
        >
            <Box
                style={{
                    position: 'absolute',
                    left: '10%',
                    right: '10%',
                    top: '0%', // Adjust top positioning as needed
                    height: '50%',
                    width: '45%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Search Box */}
                <Box
                    p={4}
                    border="2px solid black"
                    borderTop="none"
                    bgcolor='white'
                    boxShadow={4}
                    minWidth='420px'
                    zIndex='1'
                    width='100%'
                    maxWidth='500px'
                    position='absolute'
                    top='0'
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Autocomplete onChange={handleOriginChange}>
                        <TextField
                            label='Location'
                            variant='outlined'
                            style={{ marginBottom: '0px', width: '200%' }}
                            inputRef={originRef}
                        />
                    </Autocomplete>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSearchButtonClick}
                        style={{ width: '30px', height: '56px', border:"1px solid black", borderRadius: '0 4px 4px 0', boxShadow: 'none', backgroundColor: 'green', }}
                    >
                        🔍
                    </Button>
                </Box>
            </Box>

            {/* Google Map */}
            <GoogleMap
                center={center}
                zoom={15}
                mapContainerStyle={{ width: '100%', height: '30%' }}
                onClick={handleMapClick}
                options={{
                    zoomControl: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false
                }}
                onLoad={map => {
                    setMap(map);
                }}
            >
                {markers.map((m, index) => (
                    <Marker key={index} position={m.getPosition()} />
                ))}
            </GoogleMap>

        </Flex>)}
        </div>
  );
};

export default MiniMap;