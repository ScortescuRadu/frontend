import '../homepage/index.css';
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import ParkingLots from './ParkingLots';
import ParkingLotInfo from './ParkingLotInfo';

const MyAccountPage = () => {
    const [userData, setUserData] = useState({});
    const { register, handleSubmit, setValue } = useForm();
    const firstMount = useRef(true)
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    const data = [
      {
        src: 'https://images.unsplash.com/photo-1502657877623-f66bf489d236',
        title: 'Night view',
        description: '4.21M views',
      },
      {
        src: 'https://images.unsplash.com/photo-1527549993586-dff825b37782',
        title: 'Lake view',
        description: '4.74M views',
      },
      {
        src: 'https://images.unsplash.com/photo-1532614338840-ab30cf10ed36',
        title: 'Mountain view',
        description: '3.98M views',
      },
    ];

    useEffect(() => {
      if (firstMount.current){
      // Fetch user data when the component mounts
      const fetchUserData = async () => {
        firstMount.current = false;
        try {
            const access_token = localStorage.getItem("access_token")
            const response = await fetch('http://localhost:8000/account/user', {
            method: 'POST',
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

          console.log(data)
          setUserData(data);
          
          // Set initial form values using setValue from react-hook-form
          Object.keys(data).forEach(key => {
            setValue(key, data[key]);
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
  
      fetchUserData();
      }
    }, []);
  
    return (
      <div className='overflow-hidden flex flex-col min-h-screen'>
          {/* <h2>{userData.user}</h2> */}
        <ParkingLots />
        <ParkingLotInfo />
      </div>
    );
}

export default MyAccountPage;