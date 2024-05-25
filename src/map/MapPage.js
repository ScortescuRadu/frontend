import '@reach/combobox/styles.css';
import './mapStyles.css';
import { Flex } from '@chakra-ui/react';
import { Box, Button, TextField, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';
import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import React, {useState, useEffect, useRef} from 'react';
import InputLabel from '@mui/material/InputLabel';
import { findClosestMarker, getCoordsFromAddress, calculateDistance } from './MapUtils';
import ImageGallery from '../image_dataset/ImageGallery'
import LeafletMap from './LeafletMap';

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
  const [directionWalkingResponse, setWalkingDirectionResponse] = useState(null)
  const [distanceWalking, setWalkingDistance] = useState('')
  const [durationWalking, setWalkingDuration] = useState('')

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);

  /** @type React.MutableRefObject<HTMLInputElement>  */
  const originRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement>  */
  const destinationRef = useRef()

  useEffect(() => {
    // Fetch markers data when the component is mounted
    const fetchMarkers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/map/markers/');
        const data = await response.json();
        setMarkers(data);
        setSelectedMarker(null);
      } catch (error) {
        console.error('Error fetching markers:', error);
      }
    };

    fetchMarkers();
  }, []); // Empty dependency array ensures that the effect runs only once when mounted

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
  setWalkingDirectionResponse(null);

  if (directionResponse) {
    directionResponse.setMap(null);
  }
  if (directionWalkingResponse) {
    directionWalkingResponse.setMap(null);
  }

  // Calculate the closest marker to the destination
  const destinationCoords = await getCoordsFromAddress(destinationRef.current.value);

  if (!destinationCoords) {
    console.log('Error getting destination coordinates');
    return;
  }
  console.log('Destination Coordinates:', destinationCoords);
  const closestMarker = findClosestMarker(destinationCoords, markers);
  if (!closestMarker) {
    console.log('No markers available');
    return;
  }
  console.log('Closest Marker:', closestMarker);

  console.log('Calculating route');
  const directionService = new window.google.maps.DirectionsService();

    try {
      // Driving Route
      const drivingRoute = await directionService.route({
        origin: originRef.current.value,
        destination: {
          lat: closestMarker.latitude,
          lng: closestMarker.longitude,
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
      });
      
      const drivingRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        directions: drivingRoute,
      });
      setDirectionResponse(drivingRenderer);
      setDistance(drivingRoute?.routes[0]?.legs[0]?.distance?.text || 'N/A');
      setDuration(drivingRoute?.routes[0]?.legs[0]?.duration?.text || 'N/A');

      // Walking Route
      // Calculate the route on foot from the closest marker to the destination
      const walkingRoute = await directionService.route({
        origin: {
          lat: closestMarker.latitude,
          lng: closestMarker.longitude,
        },
        destination: destinationRef.current.value,
        travelMode: window.google.maps.TravelMode.WALKING,
      });

      const walkingRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        directions: walkingRoute,
        polylineOptions: {
          strokeColor: '#23c449', // Color of the line
          strokeOpacity: 1.0,
          strokeWeight: 3,
          icons: [
            {
              icon: {
                path: 'M 0,-1 0,1',
                strokeOpacity: 1,
                scale: 4,
              },
              offset: '0',
              repeat: '40px', // Adjust the dash length here
            },
          ],
        },
      });
      setWalkingDirectionResponse(walkingRenderer);
      setWalkingDistance(walkingRoute?.routes[0]?.legs[0]?.distance?.text || 'N/A');
      setWalkingDuration(walkingRoute?.routes[0]?.legs[0]?.duration?.text || 'N/A');

    } catch (error) {
      console.error('Error calculating route:', error);
    }
  }

  function clearRoute() {
    if (directionResponse) {
      directionResponse.setMap(null);
    }
    if (directionWalkingResponse) {
      directionWalkingResponse.setMap(null);
    }
    setDirectionResponse(null)
    setWalkingDirectionResponse(null)
    setDistance('')
    setDuration('')
    originRef.current.value = ''
    destinationRef.current.value = ''
  }

  const handleMarkerClick = async (marker) => {
    setSelectedMarker(marker)
    const lat = marker.latitude;
    const lng = marker.longitude;

    try {
      // Fetch the address using Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      const formattedAddress = data.results[0]?.formatted_address;

      if (formattedAddress) {
        destinationRef.current.value = formattedAddress;
        setDestination(formattedAddress);
      } else {
        console.error('No address found for the selected location');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  return (
    <Flex
      position='relative'
      flexDirection='column'
      alignItems='center'
      backgroundColor='black'
      bgPos='bottom'
      h='300vh'
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
                // label={<InputLabel shrink={destination.length > 0} htmlFor="destination">Destination</InputLabel>}
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
            {directionWalkingResponse && <Typography>Walking Distance: {distanceWalking}</Typography>}
            {directionWalkingResponse && <Typography>Walking Duration: {durationWalking}</Typography>}
          </div>
        </Box>
      </Box>
      
      {/* Google Map */}
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: '100%', height: '80%' }}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        }}
        onLoad={map => setMap(map)}
      >
        {selectedMarker && (
          <InfoWindow
            onCloseClick={() => {
              setSelectedMarker(null);
            }}
            position={{
              lat: selectedMarker.latitude,
              lng: selectedMarker.longitude
            }}
          >
            <div>
              <h3>{selectedMarker.latitude}</h3>
              <h5>{selectedMarker.longitude}</h5>
              <h5>{selectedMarker.is_subscribed}</h5>
              <p>Price: </p>
            </div>
          </InfoWindow>
        )}
        {/* Displaying markers or directions */}
        {markers.map((marker, index) => (
        <Marker
          key={index}
          position={{ lat: marker.latitude, lng: marker.longitude }}
          icon={{
            url: marker.is_subscribed
              ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' // Unsubscribed marker icon
              : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png', // Subscribed marker icon
            scaledSize: new window.google.maps.Size(40, 40), // Adjust the size as needed
          }}
          onClick={() => {handleMarkerClick(marker);}}
        />
      ))}
        {/* <Marker position={center}/> */}
        {directionResponse && <DirectionsRenderer directions={directionResponse}/>}
      </GoogleMap>
      <ImageGallery/>
      <LeafletMap/>
    </Flex>
  );
};

export default MapPage;
