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

const ParkingLotInfo = ({ selectedAddress }) => {
    const [userData, setUserData] = useState({});
    const [occupancyData, setOccupancyData] = useState({});
    const [incomeData, setIncomeData] = useState({});

    const fetchUserData = async () => {
        const fetchUserData = async () => {
          try {
              const access_token = localStorage.getItem("access_token")
              const streetAddress = localStorage.getItem("selectedAddressOption");

              const response = await fetch(`http://localhost:8000/parking/lot-details/?token=${access_token}`, {
              method: 'POST',
              headers: {
                  "Content-Type": "application/json",
                  'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                },
              body: JSON.stringify({
                  token: access_token,
                  street_address: selectedAddress !== "" ? selectedAddress : ""
              }),
            });

            const data = await response.json();
            console.log('info:')
            console.log(data)
            setUserData(data)
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };

        fetchUserData();
      };

      const fetchOccupancyData = async () => {
        const fetchOccupancyData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/ocupancy/by-address/', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                    },
                    body: JSON.stringify({
                        street_address: selectedAddress !== "" ? selectedAddress : ""
                    }),
                });

                const data = await response.json();
                console.log('Occupancy data:', data);
                setOccupancyData(data);
            } catch (error) {
                console.error('Error fetching occupancy data:', error);
            }
        };

        if (selectedAddress) {
            fetchOccupancyData();
        }
    };
    
    const fetchIncomeData = async () => {
      const fetchIncomeData = async () => {
          try {
              const response = await fetch('http://127.0.0.1:8000/income/by-address/', {
                  method: 'POST',
                  headers: {
                      "Content-Type": "application/json",
                      'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                  },
                  body: JSON.stringify({
                      street_address: selectedAddress !== "" ? selectedAddress : ""
                  }),
              });

              const data = await response.json();
              console.log('Income data:', data);
              setIncomeData(data);
          } catch (error) {
              console.error('Error fetching income data:', error);
          }
      };

      if (selectedAddress) {
          fetchIncomeData();
      }
    };

    useEffect(() => {
      fetchUserData();
      fetchOccupancyData();
      fetchIncomeData();
    }, [selectedAddress]);

    useEffect(() => {
      const socket = new WebSocket('ws://localhost:8000/ws/parking_lot_updates/');

      socket.onopen = () => {
          console.log('WebSocket connection established');
      };

      socket.onmessage = (event) => {
          console.log('WebSocket message received:', event.data);
          const update = JSON.parse(event.data);

          if (update.street_address === selectedAddress) {
              fetchUserData();
              fetchOccupancyData();
              fetchIncomeData();
          }
      };

      socket.onclose = () => {
          console.log('WebSocket connection closed');
      };

      return () => {
          socket.close();
      };
    }, [selectedAddress]);

    const weeklyIncomeData = Object.keys(incomeData.daily_current || {}).map(day => ({
      name: day,
      currentEarnings: incomeData.daily_current[day],
      averageEarnings: incomeData.daily_average[day] || 0,
    }));

    const monthlyIncomeData = Object.keys(incomeData.monthly_total || {}).map(month => ({
      name: month,
      earnings: incomeData.monthly_total[month]
    }));

    const yearlyIncomeData = Object.keys(incomeData.yearly_total || {}).map(year => ({
        name: year,
        earnings: incomeData.yearly_total[year]
    }));

    const totalEarnings = Object.values(incomeData.yearly_total || {}).reduce((a, b) => a + b, 0);

    const dailyData = occupancyData.current_occupancy ? Object.keys(occupancyData.current_occupancy['Tuesday']).map(time => ({
      time,
      occupancy: occupancyData.current_occupancy['Tuesday'][time],
      averageOccupancy: occupancyData.average_occupancy['Tuesday'][time] || 0,
    })) : [];

    const weeklyData = occupancyData.current_occupancy ? Object.keys(occupancyData.current_occupancy).map(day => ({
        time: day,
        occupancy: Object.values(occupancyData.current_occupancy[day]).reduce((a, b) => a + b, 0) / Object.values(occupancyData.current_occupancy[day]).length,
        averageOccupancy: (Object.values(occupancyData.average_occupancy[day] || {}).reduce((a, b) => a + b, 0) / Object.values(occupancyData.average_occupancy[day] || {}).length) || 0,
    })) : [];

    return (
       <div style={{ padding: '20px', backgroundColor: '#62728c' }}>
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={4}>
                <CityCardWidget cityName={userData.cityName}/>
                <PriceWidget price={userData.price ? userData.price : 0} isLoading={!userData.price}/>
                <PhoneNumberWidget initialPhoneNumber={userData.phone_number ? userData.phone_number : ""} isLoading={!userData.phone_number}/>
                <TimeSettingsWidget
                  openingWeekdays={userData.weekday_opening_time ? userData.weekday_opening_time : ""}
                  closingWeekdays={userData.weekday_closing_time ? userData.weekday_closing_time : ""}
                  openingWeekends={userData.weekend_opening_time ? userData.weekend_opening_time: ""}
                  closingWeekends={userData.weekend_closing_time ? userData.weekend_closing_time : ""}
                  isLoading={!userData.weekday_opening_time}/>
                <CapacityWidget
                  capacity={userData.capacity ? userData.capacity : null}
                  occupied={34}
                  reserved={25}
                  isLoading={!userData.capacity}
                />
                <AddressWidget
                  initialLat={userData.latitude ? parseFloat(userData.latitude) : null}
                  initialLng={userData.longitude ? parseFloat(userData.longitude) : null}
                  isFetchLoading={!(userData.latitude && userData.longitude)}
                />
                <EarningsWidget weeklyData={weeklyIncomeData} monthlyData={monthlyIncomeData} yearlyData={yearlyIncomeData} totalEarnings={totalEarnings} />
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
            <ParkingLotWidget selectedAddress={selectedAddress}/>
        </div>
    );
}

export default ParkingLotInfo;