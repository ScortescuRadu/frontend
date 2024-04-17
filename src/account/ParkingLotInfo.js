import '../homepage/index.css';
import React, { useState, useEffect, useRef } from 'react';
import { Masonry } from '@mui/lab';
import { Divider, Typography } from '@mui/material';
import PriceWidget from './components/PriceWidget';
import PhoneNumberWidget from './components/PhoneNumberWidget';
import TimeSettingsWidget from './components/TimeSettingsWidget';
import AddressWidget from './components/AddressWidget';
import CapacityWidget from './components/CapacityWidget';
import CityCardWidget from './components/CityWidget';
import EarningsWidget from './components/EarningsWidget';
import OccupancyWidget from './components/OccupancyWidget';
import QrCodeWidget from './components/QrCodeWidget';
import ParkingLotWidget from './components/ParkingLotWidget';

const ParkingLotInfo= () => {
    const [userData, setUserData] = useState({});
    const firstMount = useRef(true)

    useEffect(() => {
        const fetchUserData = async () => {
          try {
              const access_token = localStorage.getItem("access_token")
              const response = await fetch(`http://localhost:8000/parking/details/?token=${access_token}`, {
              method: 'GET',
              headers: {
                  "Content-Type": "application/json",
                  'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                },
              // credentials: 'include',
              body: JSON.stringify({
                  token: access_token,
              }),
            });
    
            const data = await response.json();
            console.log('info:')
            console.log(data)
    
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
    
        fetchUserData();
      }, []);

    const monthlyData = [
        { name: 'Jan', earnings: 400 },
        { name: 'Feb', earnings: 300 },
        { name: 'March', earnings: 500 },
        { name: 'April', earnings: 400 },
        { name: 'March', earnings: 400 },
        { name: 'May', earnings: 300 },
    ];
    const yearlyData = [
        { name: '2021', earnings: 5000 },
        { name: '2022', earnings: 6000 },
    ];
    const totalEarnings = 12000;


    const dailyData = [
      { time: '08:00', occupancy: 20 },
      { time: '09:00', occupancy: 60 },
      { time: '10:00', occupancy: 90 },
      { time: '11:00', occupancy: 90 },
      { time: '12:00', occupancy: 90 },
      { time: '13:00', occupancy: 90 },
      { time: '14:00', occupancy: 90 },
      { time: '15:00', occupancy: 90 },
      { time: '16:00', occupancy: 90 },
      { time: '17:00', occupancy: 90 },
      { time: '18:00', occupancy: 90 },
      { time: '19:00', occupancy: 90 },
      { time: '20:00', occupancy: 90 },
      { time: '21:00', occupancy: 90 },
      { time: '22:00', occupancy: 90 },
      { time: '23:00', occupancy: 90 },
      { time: '00:00', occupancy: 90 },
      { time: '01:00', occupancy: 90 },
      { time: '02:00', occupancy: 90 },
      { time: '03:00', occupancy: 90 },
  ];
  const weeklyData = [
      { time: 'Monday', occupancy: 30 },
      { time: 'Tuesday', occupancy: 45 },
      { time: 'Wednesday', occupancy: 75 },
  ];

    return (
       <div style={{ padding: '20px', backgroundColor: '#62728c' }}>
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={4}>
                <CityCardWidget cityName={'Timisoara'}/>
                <PriceWidget price={2.00} />
                <PhoneNumberWidget initialPhoneNumber="123-456-7890" />
                <TimeSettingsWidget />
                <CapacityWidget capacity={100} occupied={34} reserved={25}/>
                <AddressWidget />
                <EarningsWidget monthlyData={monthlyData} yearlyData={yearlyData} totalEarnings={totalEarnings} />
                <OccupancyWidget dailyData={dailyData} weeklyData={weeklyData} />
                <QrCodeWidget />
            </Masonry>
            <Divider style={{ margin: '20px 0', backgroundColor: 'white' }} /> {/* Adjust the color as needed */}
            <div style={{
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'center', // Horizontally center the content
                  alignItems: 'center', // Vertically center the content
              }}>
              <Typography
                  variant="h4"
                  component="h2"
                  style={{
                      textAlign: 'center',
                      color: 'white',
                      marginBottom: '20px',
                      fontWeight: 'bold',
                      padding: '10px 20px',
                      border: '2px solid white',
                      display: 'inline-block', // Ensures the border wraps the text tightly
                      borderRadius: '5px', // Optionally adds rounded corners to the border
                      backgroundColor: 'rgba(0, 0, 0, 0.2)' // Optionally adds a slight background tint
                  }}
              >
                  Parking Lot Management
              </Typography>
            </div>
            <ParkingLotWidget />
        </div>
    );
}

export default ParkingLotInfo;