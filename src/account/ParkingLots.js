import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';

const options = [
  'Apple',
  'Banana',
  'Cherry',
  'Date',
  'Grape',
  'Lemon',
  'Orange',
  'Peach',
  'Pear',
  'Plum',
];

const ParkingLots = () => {
  const [selectedOption, setSelectedOption] = useState(options[0]);

  useEffect(() => {
    // Retrieve selected option from local storage on component mount
    const storedOption = localStorage.getItem('selectedOption');
    if (storedOption && options.includes(storedOption)) {
      setSelectedOption(storedOption);
    }
  }, []);

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

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSelectChange = (event, value) => {
    // Update selected option and save to local storage
    setSelectedOption(value);
    localStorage.setItem('selectedOption', value);
  };

  return (
    <div style={{ display: 'flex', margin: '0', justifyContent: 'center' }}>
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
          options={options}
          value={selectedOption}
          onChange={handleSelectChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              fullWidth
              defaultValue={options[0]}
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
