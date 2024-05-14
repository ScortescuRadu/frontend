import '../homepage/index.css';
import React from 'react';
import ParkingLotManagement from './ParkingLotManagement';

const MyAccountPage = () => {
  
    return (
      <div className='overflow-hidden flex flex-col min-h-screen'>
        <ParkingLotManagement />
      </div>
    );
}

export default MyAccountPage;