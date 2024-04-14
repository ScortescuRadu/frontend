import React, { useState, useEffect } from "react";
import axios from 'axios';

const ProductDisplay = ({ handleCheckout }) => (
  <section>
    <div className="product">
      <img
        src="https://i.imgur.com/EHyR2nP.png"
        alt="The cover of Stubborn Attachments"
      />
      <div className="description">
        <h3>Stubborn Attachments</h3>
        <h5>$20.00</h5>
      </div>
    </div>
    <button onClick={handleCheckout} type="button">
      Checkout
    </button>
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

  useEffect(() => {
    if (!localStorage.getItem('csrfToken')) {
        fetchCsrfToken();
    }

    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setMessage("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      setMessage("Order canceled -- continue to shop around and checkout when you're ready.");
    }
  }, []);

  const handleCheckout = async () => {
    const csrfToken = localStorage.getItem('csrfToken');

    const data = {
        price: 0.5,  // Replace with the variable or value representing the price
        // Include any other additional data expected by your Django server if needed
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
    <ProductDisplay handleCheckout={handleCheckout} />
  );
}
