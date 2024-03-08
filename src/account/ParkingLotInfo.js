import '../homepage/index.css';
import React, { useState, useEffect, useRef } from 'react';

const ParkingLotInfo= () => {
    const [userData, setUserData] = useState({});
    const firstMount = useRef(true)

    useEffect(() => {
        const fetchUserData = async () => {
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
            console.log('info:')
            console.log(data)
    
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
    
        fetchUserData();
      }, []);

    return (
      <div>
        <div>Parking Lot Info Coming in!</div>
      </div>
    );
}

export default ParkingLotInfo;