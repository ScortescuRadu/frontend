import React, { useState, useEffect } from 'react';
import { Box, Button, Container, FormControl, Grow, InputLabel, OutlinedInput, ToggleButtonGroup, ToggleButton, InputAdornment, IconButton, Autocomplete, TextField, Paper, Grid, Card, CardMedia, CardContent, Typography, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import myVideo from './assets/parking.mp4';
import exampleImage from './assets/events.jpg';
import ConfirmButton from './components/ConfirmButton';

// Sample data for the images, titles, and text
const imageData = [
    {
      img: './path/to/image1.jpg',
      title: 'First Image',
      text: 'Description for the first image.'
    },
    {
      img: './path/to/image2.jpg',
      title: 'Second Image',
      text: 'Description for the second image.'
    },
    {
      img: './path/to/image3.jpg',
      title: 'Third Image',
      text: 'Description for the third image.'
    }
  ];

const theme = createTheme({
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          width: '100%', // Set 100% width to fill the container
          marginTop: '20px',
        },
      },
    },
    MuiToggleButton: {
        styleOverrides: {
            root: {
              fontWeight: 'bold',
              backgroundColor: '#fff', // Default background color
              '&.Mui-selected': {
                backgroundColor: '#222', // Background color when selected
                color: '#fff',
              },
              '&:hover': {
                backgroundColor: '#e6f9fa', // Yellow background on hover
                color: '#000', // Optional: change text color on hover if needed
                // Prevent the hover color from applying when the button is selected
                '@media (hover: none)': {
                  backgroundColor: 'transparent',
                },
              },
            },
          },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '20px',
          backgroundColor: '#fff',
          boxShadow: '5px 5px 0px rgba(0,0,0,0.5)',
          display: 'flex', // Ensure flex layout
          flexDirection: 'column', // Stack elements vertically
          alignItems: 'center', // Center align the children horizontally
          width: '80%', // Maintain consistent external width
          maxWidth: '600px', // Max width for larger screens
          margin: 'auto', // Center the paper component
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          width: '100%', // Ensure width matches FormControl
        },
        inputRoot: {
          width: '100%', // Make sure the input element fills the container
        },
      },
    },
  },
});

const PaymentView = () => {
    const [searchValue, setSearchValue] = useState('');
    const [alignment, setAlignment] = useState('pay');
    const [options, setOptions] = useState([]);
    const [inputLabel, setInputLabel] = useState('Enter License Plate');
    const [isLoading, setIsLoading] = useState(false);
    const [serverResponse, setServerResponse] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [fallbackParkingLot, setFallbackParkingLot] = useState('');
    const [parkingLots, setParkingLots] = useState([]); // This would be fetched similar to earlier examples

  useEffect(() => {
    if (alignment === 'reserve') {
      loadParkingLots();
    }
  }, [alignment]);

  const loadParkingLots = async () => {
    const response = await new Promise((resolve) => setTimeout(() => resolve(['Lot 1', 'Lot 2', 'Lot 3', 'Lot 4', 'Lot 5']), 1000));
    setOptions(response);
  };

  const handleAlignment = (event, newAlignment) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      setInputLabel(newAlignment === 'pay' ? 'Enter License Plate' : 'Select Parking Lot');
    }
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

    const handleSearchClick = async () => {
        setIsLoading(true);
        try {
        const response = await axios.post('https://api.example.com/search', { licensePlate: searchValue });
        if (response.data.status === 'ok') {
            setServerResponse(response.data);
            setErrorMessage('');
        } else {
            setErrorMessage('Could not find car, let\'s search your parking lot address:');
            setServerResponse(null);
            setFallbackParkingLot('');
        }
        } catch (error) {
        console.error('Search request failed:', error);
        setErrorMessage('Failed to connect to the server.');
        setServerResponse(null);
        }
        setIsLoading(false);
    };

    const handleFallbackSearch = async () => {
        setIsLoading(true);
        try {
          const response = await axios.post('https://api.example.com/fallbackSearch', { licensePlate: searchValue, parkingLot: fallbackParkingLot });
          if (response.data.status === 'ok') {
            setServerResponse(response.data);
            setErrorMessage('');
          } else {
            setErrorMessage('Could not process the fallback search.');
          }
        } catch (error) {
          console.error('Fallback search request failed:', error);
          setErrorMessage('Failed to connect during fallback search.');
        }
        setIsLoading(false);
      };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '50vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <video autoPlay loop muted style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}>
          <source src={myVideo} type="video/mp4" />
        </video>
        <Paper elevation={6} sx={{ zIndex: 1 }}>
          <ToggleButtonGroup
            color="primary"
            value={alignment}
            exclusive
            onChange={handleAlignment}
            aria-label="search options"
            sx={{ marginBottom: '20px', width: '100%' }} // Ensure full width
          >
            <ToggleButton value="pay" aria-label="pay">Pay</ToggleButton>
            <ToggleButton value="reserve" aria-label="reserve">Reserve</ToggleButton>
          </ToggleButtonGroup>
          {alignment === 'pay' ? (
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="search-field">{inputLabel}</InputLabel>
              <OutlinedInput
                id="search-field"
                value={searchValue}
                onChange={handleSearchChange}
                label={inputLabel}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearchClick} aria-label="search" disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} /> : <SearchIcon />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {serverResponse && (
                <Typography sx={{ mt: 2 }}>{`Price: ${serverResponse.price}, Address: ${serverResponse.parkingLotAddress}`}</Typography>
              )}
              {errorMessage && (
                <>
                  <Typography color="error" sx={{ mt: 2 }}>{errorMessage}</Typography>
                  <Autocomplete
                    fullWidth
                    options={options}
                    getOptionLabel={option => option.toString()}
                    value={fallbackParkingLot}
                    onChange={(event, newValue) => setFallbackParkingLot(newValue)}
                    renderInput={(params) => <TextField {...params} label="Select Parking Lot" variant="outlined" />}
                    sx={{ mt: 1 }}
                  />
                  <ConfirmButton onClick={handleFallbackSearch} />
                </>
              )}
            </FormControl>
          ) : (
            <Autocomplete
                fullWidth
                options={options}
                onInputChange={(event, newValue) => {
                    setSearchValue(newValue);
                }}
                renderInput={(params) => <TextField {...params} label={inputLabel} variant="outlined" />}
            />
          )}
        </Paper>
      </Box>
      {/* New section for images with text */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #000, #6a0dad)', // Black to purple gradient
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={2} justifyContent="center">
                {imageData.map((data, index) => (
                <Grid item xs={12} sm={12} md={4} key={index}>
                    <Card>
                    <CardMedia
                        component="img"
                        height="140"
                        image={data.img}
                        alt={data.title}
                        sx={{ borderRadius: '50%' }}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                        {data.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        {data.text}
                        </Typography>
                    </CardContent>
                    </Card>
                </Grid>
                ))}
            </Grid>
            </Container>
        </Box>
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
                backgroundColor: '#bfb7a1', // Black to purple gradient
            }}>
            <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2, paddingLeft: '40px' }}>
                    This is a <Box component="span" sx={{ backgroundColor: '#ffff00', color: '#000' }}>Highlighted Title</Box>
                </Typography>
                <Typography variant="body1" color="text.secondary" padding='20px'>
                    Here is some explanatory text about the topic. This text can be a couple of paragraphs long and should provide the reader with all the necessary information on the topic, formatted in a clear and accessible way.
                </Typography>
                </Grid>
                <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
                <Box
                    component="img"
                    src={exampleImage}
                    alt="Descriptive Alt Text"
                    sx={{ width: '100%', height: 'auto', borderRadius: 0 }}
                />
                </Grid>
            </Grid>
        </Box>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '40px 20px',
                backgroundColor: '#000',
                textAlign: 'center'
            }}
            >
            <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={1000}>
                <Box>
                <Typography variant="h3" component="span" sx={{ fontSize: '4rem', fontWeight: 'bold', color: 'yellow' }}>
                    100
                </Typography>
                <Typography variant="subtitle1" sx={{ display: 'block', color: 'yellow' }}>
                    Clients
                </Typography>
                </Box>
            </Grow>
            <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={1000}>
                <Box>
                <Typography variant="h3" component="span" sx={{ fontSize: '4rem', fontWeight: 'bold', color: '#3f51b5' }}>
                    20
                </Typography>
                <Typography variant="subtitle1" sx={{ display: 'block', color: '#3f51b5' }}>
                    Parking Lots
                </Typography>
                </Box>
            </Grow>
            <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={1000}>
                <Box>
                <Typography variant="h3" component="span" sx={{ fontSize: '4rem', fontWeight: 'bold', color: '#fff' }}>
                    12
                </Typography>
                <Typography variant="subtitle1" sx={{ display: 'block', color: '#fff' }}>
                    Months on the market
                </Typography>
                </Box>
            </Grow>
            </Box>
    </ThemeProvider>
  );
}

export default PaymentView;