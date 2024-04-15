import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import InvoiceDetails from './InvoiceDetails';
import { Button } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const ProductDisplay = ({ handleCheckout, invoiceData }) => (
    <section style={{ textAlign: 'center', padding: '20px' }}>
      <InvoiceDetails 
        licensePlate={invoiceData.licensePlate}
        spot={invoiceData.spot}
        timestamp={invoiceData.timestamp}
        price={invoiceData.price}
      />
      <Button
        onClick={handleCheckout}
        type="button"
        variant="contained"
        color="primary"
        size="large"
        startIcon={<ShoppingCartIcon />}
        sx={{
          mt: 2,
          backgroundColor: '#000', // Use theme secondary color
          '&:hover': {
            backgroundColor: 'green', // Darken button on hover
          },
          padding: '10px 20px',
          fontSize: '1rem' // Bigger font size for better readability
        }}
      >
        Checkout
      </Button>
    </section>
);


const Message = ({ message }) => (
  <section>
    <p>{message}</p>
  </section>
);

const fetchCsrfToken = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/account/csrf/');
      const csrfToken = response.data.csrfToken;
      localStorage.setItem('csrfToken', csrfToken);
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
};

export default function StripeCheckout() {
    const [message, setMessage] = useState("");
    const location = useLocation(); // Hook to access URL location
    const queryParams = new URLSearchParams(location.search); // Parse the query string
    const licensePlate = queryParams.get('license');
    const spot = queryParams.get('spot');
    const timestamp = queryParams.get('timestamp');
    const [invoiceData, setInvoiceData] = useState({
        licensePlate: licensePlate || "Unknown License",
        spot: spot || "Unknown Spot",
        timestamp: timestamp || new Date().toISOString(),
        price: 0.00
    });

    useEffect(() => {
        const fetchPrice = async () => {
            const csrfToken = localStorage.getItem('csrfToken');
            const headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            };

            try {
                const response = await axios.post('http://127.0.0.1:8000/parking-invoice/calculate-price/', {
                    license_plate: licensePlate,
                    timestamp: timestamp
                }, { headers });

                if (response.status === 200) {
                    setInvoiceData(currentData => ({
                        ...currentData,
                        price: response.data.price
                    }));
                } else {
                    setMessage("Failed to calculate price. Please try again.");
                }
            } catch (error) {
                console.error('Error fetching price:', error);
                setMessage("Error fetching price from server.");
            }
        };

        if (licensePlate && timestamp) {
            fetchPrice();
        }
    }, [licensePlate, timestamp]);

  const handleCheckout = async () => {
    const csrfToken = localStorage.getItem('csrfToken');

    const data = {
        price: invoiceData.price * 100,
        name: `${invoiceData.licensePlate} parking time`,
        timestamp: invoiceData.timestamp,
        licensePlate: invoiceData.licensePlate,
        spot: invoiceData.spot
    };

    const response = await fetch("http://127.0.0.1:8000/payment/web/checkout/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
      const session = await response.json();
      // Assuming the session URL is sent back from the server
      window.location = session.url;
    } else {
      setMessage("Failed to start the checkout session. Please try again.");
    }
  };

  return message ? (
    <Message message={message} />
  ) : (
    <ProductDisplay handleCheckout={handleCheckout} invoiceData={invoiceData}/>
  );
}
