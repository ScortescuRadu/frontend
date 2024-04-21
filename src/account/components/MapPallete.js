import React from 'react';
import { Button, Box } from '@mui/material';
import spot from '../assets/spot.jpg'
import road from '../assets/road.jpg'
import grass from '../assets/grass.jpg'

const tileTypes = {
    parking: { texture: spot, icon: '🚗' },
    road: { texture: road, icon: '🛣️' },
    grass: { texture: grass, icon: '🌱' },
    erase: { icon: '🧽' }
};


const MapPalette = ({ setCurrentType }) => {
    return (
        <Box display="flex">
            {Object.entries(tileTypes).map(([type, { texture, icon }]) => (
                <Button
                    key={type}
                    onClick={() => setCurrentType(type === 'erase' ? 'erase' : type)}
                    style={{ margin: 4, fontSize: '24px', minWidth: '50px' }}>
                    {icon}
                </Button>
            ))}
        </Box>
    );
};

export default MapPalette;
