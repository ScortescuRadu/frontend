import React, { useState } from 'react';
import { Card, Typography, Select, MenuItem, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import ParkingLot3D from './ParkingLot3D';

const ParkingLotWidget = () => {
  const [selectedLevel, setSelectedLevel] = useState(1);

  const parkingLevels = {
    1: {
      A: { occupied: 20, capacity: 50 },
      B: { occupied: 30, capacity: 50 },
      // More sections as needed
    },
    2: {
      A: { occupied: 15, capacity: 40 },
      B: { occupied: 28, capacity: 40 },
      // More sections as needed
    },
    // More levels as needed
  };

  // Change the level in the dropdown
  const handleChangeLevel = (event) => {
    setSelectedLevel(event.target.value);
  };

  const levels = Object.keys(parkingLevels);

  return (
    <Card sx={{ padding: '20px', margin: '20px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Parking Lot Management</Typography>
        <IconButton>
          <AddIcon />
        </IconButton>
      </Box>
      <Select
        value={selectedLevel}
        onChange={handleChangeLevel}
        fullWidth
        sx={{ my: 2 }}
      >
        {levels.map((level) => (
          <MenuItem key={level} value={level}>
            Level {level}
          </MenuItem>
        ))}
      </Select>
      <Box>
        {Object.entries(parkingLevels[selectedLevel]).map(([section, { occupied, capacity }]) => (
          <Typography key={section} sx={{ mb: 1 }}>
            Section {section}: {occupied}/{capacity}
          </Typography>
        ))}
      </Box>
      {/* Placeholder for parking map */}
      <ParkingLot3D />
    </Card>
  );
};

export default ParkingLotWidget;
