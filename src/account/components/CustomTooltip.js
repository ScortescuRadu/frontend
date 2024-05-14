import React from 'react';
import { Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px'
            }}>
                <p className="label">{`${label}`}</p>
                <p className="intro">{`Current Occupancy: ${payload[0].value}`}</p>
                <p className="intro">{`Average Occupancy: ${payload[1].value}`}</p>
            </div>
        );
    }

    return null;
};

export default CustomTooltip;
