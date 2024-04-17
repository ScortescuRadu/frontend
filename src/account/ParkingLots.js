import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';

const ParkingLots = () => {
  const [selectedOption, setSelectedOption] = useState([]);
  const [fetchedOptions, setFetchedOptions] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
          const access_token = localStorage.getItem("access_token")
          const response = await fetch(`http://localhost:8000/parking/user/street-address/?token=${access_token}`, {
          method: 'GET',
          headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
            },
        });

        const data = await response.json();
        console.log('lots info:')
        console.log(data)

        // Extract street addresses from the fetched data
        const streetAddresses = data.map((item) => item.street_address);

        // Set the fetched options in state
        setFetchedOptions(streetAddresses);
        // Set the default selected option to the first one, if available
        setSelectedOption(streetAddresses[0] || '');

        // Store street addresses in local storage
        localStorage.setItem('streetAddresses', JSON.stringify(streetAddresses));

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSelectChange = (event, value) => {
    // Update selected option and save to local storage
    setSelectedOption(value);
    localStorage.setItem('selectedAddressOption', value);
  };

  return (
    <div style={{ display: 'flex', margin: '0', justifyContent: 'center', backgroundColor: '#62728c' }}>
      <Box
        sx={{
          position: 'relative',
          background: 'snow',
          padding: '20px',
          marginBottom: '20px',
          width: '100%',
          '@media (min-width: 600px)': {
            width: '70%',
          },
          height: '100px',
          border: '2px solid black',
          borderBottomLeftRadius: '25px',
          boxSizing: 'border-box', // Add this to include padding in width calculation
        }}
      >
        <Autocomplete
          options={fetchedOptions}
          value={selectedOption}
          onChange={handleSelectChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              fullWidth
              defaultValue={fetchedOptions[0]}
              InputProps={{
                ...params.InputProps,
                style: { fontSize: '16px', paddingTop: '8px', paddingBottom: '8px' },
              }}
            />
          )}
        />
      </Box>
      <Link to={'/create-lot'}>
        <Box
          sx={{
            // marginLeft: '18px',
            display: 'flex',
            alignItems: 'center',
            background: 'green',
            borderBottomRightRadius: '25px',
            padding: '14px',
            height: '100px',
            cursor: 'pointer',
            border: '2px solid black',
          }}
        >
          <AddIcon style={{ color: 'white' }} />
        </Box>
      </Link>
    </div>
  );
};

export default ParkingLots;
