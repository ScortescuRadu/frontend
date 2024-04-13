import React from 'react';
import { Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Importing an icon

const ConfirmButton = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant="contained" // Gives the button a more defined look
      startIcon={<CheckCircleIcon />} // Adds an icon to the button
      sx={{
        mt: 1,
        padding: '10px',
        marginTop: '20px',
        bgcolor: 'black', // Use theme primary color
        color: 'white',
        '&:hover': {
          bgcolor: 'green', // Darken button on hover
          transform: 'scale(1.05)', // Slightly enlarge the button on hover
          boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)' // Add shadow for depth
        },
        transition: 'transform .2s ease-in-out', // Smooth transformation on hover
      }}
    >
      Confirm
    </Button>
  );
};

export default ConfirmButton;
