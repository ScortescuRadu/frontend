import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const EarningsWidget = ({ weeklyData, monthlyData, yearlyData, totalEarnings }) => {
  const [timeFrame, setTimeFrame] = useState('WEEKLY');

  let data;
  switch (timeFrame) {
    case 'WEEKLY':
      data = weeklyData;
      break;
    case 'MONTHLY':
      data = monthlyData;
      break;
    case 'YEARLY':
      data = yearlyData;
      break;
    default:
      data = weeklyData;
  }

  useEffect(()=>{
    console.log(weeklyData)
    console.log(monthlyData)
  })

  return (
    <Card sx={{
      minWidth: 280,
      minHeight: 300,
      boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
      border: '1px solid #333',
      borderRadius: '8px',
      margin: '10px',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between' // Changed to space-between for internal spacing
    }}>
      <CardContent sx={{ width: '100%' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 'medium', color: '#333', marginBottom: 2 }} gutterBottom>
          Total Earnings: {totalEarnings.toFixed(2)} EUR
        </Typography>
        <FormControl fullWidth sx={{ marginBottom: 3 }}> {/* Increased margin-bottom */}
          <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
          <Select
            labelId="timeframe-select-label"
            value={timeFrame}
            label="Timeframe"
            onChange={(e) => setTimeFrame(e.target.value)}
          >
            <MenuItem value="WEEKLY">Weekly</MenuItem>
            <MenuItem value="MONTHLY">Monthly</MenuItem>
            <MenuItem value="YEARLY">Yearly</MenuItem>
          </Select>
        </FormControl>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data}
            margin={{
              top: 0,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              wrapperStyle={{ zIndex: 1000 }} // Ensure tooltip is above all other elements
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }} // Semi-transparent background
            />
            {timeFrame === 'WEEKLY' ? (
              <>
                <Line type="monotone" dataKey="currentEarnings" stroke="#8884d8" activeDot={{ r: 8 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="averageEarnings" stroke="#82ca9d" />
              </>
            ) : (
              <Line type="monotone" dataKey="earnings" stroke="#8884d8" activeDot={{ r: 8 }} isAnimationActive={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EarningsWidget;
