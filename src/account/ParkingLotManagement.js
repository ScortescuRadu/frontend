import React, { useState } from 'react';
import ParkingLots from './ParkingLots';
import ParkingLotInfo from './ParkingLotInfo';

const ParkingLotManagement = () => {
  const [selectedAddress, setSelectedAddress] = useState(localStorage.getItem('selectedAddressOption') || '');

  return (
    <div>
      <ParkingLots selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress} />
      <ParkingLotInfo selectedAddress={selectedAddress} />
    </div>
  );
};

export default ParkingLotManagement;
