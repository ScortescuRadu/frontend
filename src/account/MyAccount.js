import '../homepage/index.css';
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import ParkingLots from './ParkingLots';
import ParkingLotInfo from './ParkingLotInfo';

const MyAccountPage = () => {
  
    return (
      <div className='overflow-hidden flex flex-col min-h-screen'>
          {/* <h2>{userData.user}</h2> */}
        <ParkingLots />
        <ParkingLotInfo />
      </div>
    );
}

export default MyAccountPage;