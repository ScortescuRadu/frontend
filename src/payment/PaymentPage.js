import React, { useState, useEffect } from 'react';
import { Box, Button, Container, FormControl, Grow, InputLabel, OutlinedInput, ToggleButtonGroup, ToggleButton, InputAdornment, IconButton, Autocomplete, TextField, Paper, Grid, Card, CardMedia, CardContent, Typography, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import myVideo from './assets/parking.mp4';
import exampleImage from './assets/events.jpg';
import ConfirmButton from './components/ConfirmButton';
import InvoiceSelectionCard from './components/InvoiceSelectionCard';
import { useNavigate } from 'react-router-dom';
import support from './assets/support.jpg'
import price from './assets/price.jpg'
import payment from './assets/payment.jpg'
import { formatDistanceToNowStrict, parseISO } from 'date-fns';  // Importing helper functions from date-fns


const fetchCsrfToken = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/account/csrf/');
      const csrfToken = response.data.csrfToken;
      localStorage.setItem('csrfToken', csrfToken);
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
};

// Sample data for the images, titles, and text
const imageData = [
    {
      img: payment,
      title: 'Easy Payment',
      text: 'Description for the first image.'
    },
    {
      img: price,
      title: 'Perfect Plan',
      text: 'Description for the second image.'
    },
    {
      img: support,
      title: '24/7 Support',
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
    const [serverResponse, setServerResponse] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [fallbackParkingLot, setFallbackParkingLot] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [parkingLots, setParkingLots] = useState([]); // This would be fetched similar to earlier examples
    const [city, setCity] = useState(null);
    const [cities, setCities] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [openCities, setOpenCities] = useState(false);
    const [openAddresses, setOpenAddresses] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const navigate = useNavigate();
    const [licensePlateInput, setLicensePlateInput] = useState('');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [reservationTime, setReservationTime] = useState(null)

    const isRecentReservation = () => {
      const storedTime = localStorage.getItem('reservationTime');
      if (!storedTime) return false;

      const now = new Date();
      const reservationDate = parseISO(storedTime);
      const diffMinutes = (now - reservationDate) / (1000 * 60);

      if (diffMinutes > 15) {
          // If more than 15 minutes have passed, clear local storage and state
          localStorage.removeItem('reservationTime');
          localStorage.removeItem('reservationSpot');
          localStorage.removeItem('reservationAddress');
          setReservationTime(null);
          return false;
      }

      return true;
    };

    useEffect(() => {
        if (alignment === 'reserve') {
        loadParkingLots();
        }
        if (!localStorage.getItem('csrfToken')) {
            fetchCsrfToken();
        }
        let active = true;

        if (!open) {
            setOptions([]);
        }

        if (open && options.length === 0 && active) {
            setLoading(true);
            axios.get('http://127.0.0.1:8000/city/cities/')
                .then((response) => {
                    const cities = response.data; // Assuming the response is directly an array
                    if (active) {
                        setOptions(cities);
                        setLoading(false);
                    }
                })
                .catch(() => {
                    if (active) {
                        setLoading(false);
                        // Handle errors here, e.g., by setting an error message
                    }
                });
        }

        return () => {
            active = false;
        };
    }, [alignment, open]);

    useEffect(() => {
      const storedTime = localStorage.getItem('reservationTime');
      if (storedTime) {
          setReservationTime(storedTime);
      }
      if (isRecentReservation()) {
          console.log('Reservation was made within the last 15 minutes.');
          // Additional actions can be added here if necessary
      }
    }, [reservationTime]);  // Dependency array includes reservationTime

    useEffect(() => {
        const loadCities = async () => {
          setLoadingCities(true);
          try {
            const response = await axios.get('http://127.0.0.1:8000/city/cities/');
            setCities(response.data);
          } catch (error) {
            console.error('Failed to fetch cities:', error);
          }
          setLoadingCities(false);
        };
    
        if (alignment === 'reserve') {
          loadCities();
        }
    }, [alignment]);

    useEffect(() => {
        const loadAddresses = async () => {
          if (!city) {
            setAddresses([]); // Clear addresses when no city is selected
            return;
        }
        setLoadingAddresses(true);
        try {
            const csrfToken = localStorage.getItem('csrfToken');
            const response = await axios.post('http://127.0.0.1:8000/parking/parking-lots/by-city/', {
              city_name: city
            }, {
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
              }
            });
            setAddresses(response.data);
          } catch (error) {
            console.error('Failed to fetch addresses:', error);
            setAddresses([]);
          }
          setLoadingAddresses(false);
        };
    
        loadAddresses();
      }, [city]);

    const loadParkingLots = async () => {
        const response = await new Promise((resolve) => setTimeout(() => resolve(['Lot 1', 'Lot 2', 'Lot 3', 'Lot 4', 'Lot 5']), 1000));
        setOptions(response);
    };

    const handleAlignment = (event, newAlignment) => {
        if (newAlignment !== null) {
        setAlignment(newAlignment);
        setInputLabel(newAlignment === 'pay' ? 'Enter License Plate' : 'Select Parking Lot');
        setCity(null);  // Reset city to null whenever the alignment changes
        setAddresses([]);
        setSelectedAddress(null);
        }
    };

    const handleSearchChange = (event) => {
        setSearchValue(event.target.value);
    };

    const handleSearchClick = async () => {
        setIsLoading(true);
        setLicensePlate(searchValue);
        const csrfToken = localStorage.getItem('csrfToken');
        const headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        };

        try {
            const response = await axios.post('http://127.0.0.1:8000/parking-invoice/license/unpaid/', {
              license_plate: searchValue
            }, { headers });

            if (response.status === 200 && response.data.length > 0) {
                setServerResponse(response.data);
                setSelectedInvoice(null);
            } else {
                setErrorMessage('No unpaid invoices found for this license plate. Let\'s search!');
                setServerResponse([]);
            }
        } catch (error) {
            if (error.response) {
                console.error('Search request failed:', error.response.data);
                setErrorMessage(`Error: ${error.response.status} - ${error.response.data.detail}`);
                console.error('Search request failed, no response:', error.request);
                setErrorMessage('No response from server.');
            } else {
                console.error('Error', error.message);
                setErrorMessage('Error sending request.');
            }
            setServerResponse(null);
        }
        setIsLoading(false);
    };

    const handleFallbackSearch = async () => {
        setIsLoading(true);
        try {
          const response = await axios.post('https://api.example.com/fallbackSearch', { licensePlate: searchValue, parkingLot: fallbackParkingLot });
          if (response.data.status === 'ok') {
            setServerResponse(response.data[0]);
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

    const selectInvoice = (invoice) => {
        setSelectedInvoice(invoice);
    };

    const confirmPayment = () => {
        console.log('Confirming...', selectedInvoice);
        if (selectedInvoice) {
            const queryParams = new URLSearchParams({
                license: licensePlate,
                spot: selectedInvoice.spot_description,
                timestamp: selectedInvoice.timestamp,
                address: selectedInvoice.address
            }).toString();
            navigate(`/stripe?${queryParams}`);
        }
    };

    const handleReservation = async () => {
      const csrfToken = localStorage.getItem('csrfToken');
      const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      };

      try {
        const payload = {
          "license_plate": licensePlateInput,
          "city": city,
          "address": selectedAddress.street_address,
          "token": localStorage.getItem("access_token")
        }
        console.log(payload)
        const response = await axios.post('http://127.0.0.1:8000/parking-invoice/reserve/', payload, {
          headers: {'Content-Type': 'application/json'}
        });
        if (response.data !== null) {
          setServerResponse(response.data);
          setReservationTime(response.data.timestamp);
          localStorage.setItem('reservationTime', response.data.timestamp);
          localStorage.setItem('reservationSpot', response.data.spot_description);
          localStorage.setItem('reservationAddress', selectedAddress.street_address);
        } else {
          console.error('Failed to confirm reservation:', response);
        }
      } catch (error) {
        console.error('Error making the reservation:', error);
      }
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
        <Paper elevation={6} sx={{ zIndex: 1, overflow: 'auto', maxHeight: '40vh' }}>
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
                <Box sx={{ p: 2, maxHeight: '50vh', overflowY: 'auto' }}>
                    {Array.isArray(serverResponse) ? serverResponse.map((invoice, index) => (
                        <InvoiceSelectionCard
                            key={index}
                            invoice={invoice}
                            onSelect={selectInvoice}
                            isSelected={selectedInvoice === invoice}
                        />
                    )) : (
                      <Typography color="error"></Typography>
                    )}
                </Box>
                {selectedInvoice && <ConfirmButton onClick={confirmPayment} />}
                {errorMessage && (
                <>
                  <Typography color="error" sx={{ mt: 0 }}>{errorMessage}</Typography>
                  <Autocomplete
                    fullWidth
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    isOptionEqualToValue={(option, value) => option === value}
                    getOptionLabel={(option) => option.name} // Adjust depending on how your data is structured
                    options={options}
                    loading={loading}
                    onChange={(event, newValue) => {
                        setCity(newValue?.name);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Select a City"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                    />
                    {city && (
                        <Autocomplete
                            fullWidth
                            open={openAddresses}
                            onOpen={() => setOpenAddresses(true)}
                            onClose={() => setOpenAddresses(false)}
                            isOptionEqualToValue={(option, value) => option === value}
                            getOptionLabel={(option) => option.street_address}
                            options={addresses}
                            loading={loadingAddresses}
                            onChange={(event, newValue) => {
                                setSelectedAddress(newValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select an Address"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingAddresses ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    )}
                <ConfirmButton onClick={handleFallbackSearch} />
                </>
              )}
            </FormControl>
        ) : (
          isRecentReservation() ? (
            <Typography variant="h6" color="success.main">
                Your reservation at {localStorage.getItem('reservationAddress')} for {localStorage.getItem('reservationSpot')} is confirmed and valid for the next 15 minutes!
            </Typography>
            ) : (
            <>
                <Autocomplete
                    fullWidth
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    isOptionEqualToValue={(option, value) => option === value}
                    getOptionLabel={(option) => option.name} // Adjust depending on how your data is structured
                    options={cities}
                    loading={loadingCities}
                    onChange={(event, newValue) => {
                        setCity(newValue?.name);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Select a City"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                    />
                    {city && (
                        <Autocomplete
                            fullWidth
                            open={openAddresses}
                            onOpen={() => setOpenAddresses(true)}
                            onClose={() => setOpenAddresses(false)}
                            isOptionEqualToValue={(option, value) => option === value}
                            getOptionLabel={(option) => option.street_address}
                            options={addresses}
                            loading={loadingAddresses}
                            onChange={(event, newValue) => {
                                setSelectedAddress(newValue);
                                setLicensePlateInput(''); // Reset license plate input whenever a new address is selected
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select an Address"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingAddresses ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    )}
                    {selectedAddress && city && (
                        <TextField
                            fullWidth
                            label="Enter License Plate"
                            value={licensePlateInput}
                            onChange={(e) => setLicensePlateInput(e.target.value)}
                            variant="outlined"
                            margin="normal"
                        />
                    )}
                <ConfirmButton onClick={handleReservation} />
            </>
            ))}
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
                        sx={{ borderRadius: '10%' }}
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
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2, mt:4, paddingLeft: '30px' }}>
                    Parking right where <Box component="span" sx={{ backgroundColor: '#ffff00', color: '#000' }}>you need to be</Box>
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight='bold' padding='20px' marginLeft={'30px'} marginBottom={'30px'}>
                    Finding a parking space right where you need it can often turn into a daunting task, whether you're headed to a bustling event, rushing to work, or planning a leisurely outing. Our service simplifies this challenge by connecting you to parking spots located strategically near key destinations. With just a few taps, you can reserve a spot close to your event venue, office building, or any prime location of your choosing. No more circling around in hopes of a lucky break; secure your spot ahead of time, and focus on what really matters. Enjoy peace of mind knowing that your parking is sorted, allowing you more time to enjoy your activities or get right to work without the hassle.
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
