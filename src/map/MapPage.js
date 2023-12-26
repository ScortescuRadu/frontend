import '@reach/combobox/styles.css';
import './mapStyles.css';
import { Flex } from '@chakra-ui/react';
import { Box, Button, TextField, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';
import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import React, {useState, useRef} from 'react';

const center = { lat: 45.754364, lng: 21.226750 };
const MAP_LIBRARIES = ['places']

const MapPage = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES, 
  });

  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionResponse, setDirectionResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  /** @type React.MutableRefObject<HTMLInputElement>  */
  const originRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement>  */
  const destinationRef = useRef()

  if (!isLoaded) {
    return <div>Loading</div>;
  }

  const handleOriginChange = (event, value) => {
    // originRef.current.value = value;
    setOrigin(value)
  };

  const handleDestinationChange = (event, value) => {
    // destinationRef.current.value = value;
    setDestination(value)
  };

  async function calculateRoute() {
    console.log('Lets see')
    console.log(originRef.current?.value, destinationRef.current?.value);
    console.log(origin, destination);

  if (!originRef.current || !destinationRef.current) {
    console.log('Ref is null');
    return;
  }

  if (originRef.current.value === '' || destinationRef.current.value === '') {
    console.log('Values are empty');
    return;
  }

  console.log('Clearing old route');
  setDirectionResponse(null);

  if (directionResponse) {
    directionResponse.setMap(null);
  }

  console.log('Calculating route');
  const directionService = new window.google.maps.DirectionsService();

    try {
      const results = await directionService.route({
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });
      // Create a new DirectionsRenderer for the new route
      const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        directions: results,
      });
      setDirectionResponse(newDirectionsRenderer);

      setDistance(results?.routes[0]?.legs[0]?.distance?.text || 'N/A');
      setDuration(results?.routes[0]?.legs[0]?.duration?.text || 'N/A');
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  }

  function clearRoute() {
    if (directionResponse) {
      directionResponse.setMap(null);
    }
    setDirectionResponse(null)
    setDistance('')
    setDuration('')
    originRef.current.value = ''
    destinationRef.current.value = ''
  }

  return (
    <Flex
      position='relative'
      flexDirection='column'
      alignItems='center'
      bgColor='blue.200'
      bgImage='https://i.pinimg.com/originals/86/cc/bb/86ccbb5469e5192dbdc7c031ca45d0c2.gif'
      bgPos='bottom'
      h='100vh'
      w='100vw'
    >
      <Box
        style={{
          position: 'absolute',
          left: '10%',
          right: '10%',
          top: '0%', // Adjust top positioning as needed
          height: '80%',
          width: '80%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Search Box */}
        <Box
          p={4}
          borderRadius='8px'
          bgcolor='white'
          boxShadow={4}
          minWidth='320px'
          zIndex='1'
          width='100%'
          position='absolute'
          top='0'
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Autocomplete onChange={handleOriginChange}>
              <TextField
                label='Origin'
                variant='outlined'
                style={{ marginBottom: '8px', width: '100%' }}
                inputRef={originRef}
              />
            </Autocomplete>
            <Autocomplete onChange={handleDestinationChange}>
              <TextField
                label='Destination'
                variant='outlined'
                style={{ marginBottom: '8px', width: '100%' }}
                inputRef={destinationRef}
              />
            </Autocomplete>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button variant='contained' color='primary' style={{ flex: '1', minWidth: '50%', width: '100%', marginRight: '8px' }} onClick={calculateRoute}>
                Calculate
              </Button>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <IconButton color='primary' onClick={clearRoute}>
                  <CloseIcon />
                </IconButton>
                <IconButton color='primary' onClick={() => map.panTo(center)}>
                  <LocationOnIcon />
                </IconButton>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
            {directionResponse && <Typography>Distance: {distance}</Typography>}
            {directionResponse && <Typography>Duration: {duration}</Typography>}
          </div>
        </Box>
      </Box>
      
      {/* Google Map */}
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        }}
        onLoad={map => setMap(map)}
      >
        {/* Displaying markers or directions */}
        <Marker position={center}/>
        {directionResponse && <DirectionsRenderer directions={directionResponse}/>}
      </GoogleMap>
    </Flex>
  );
};

export default MapPage;
