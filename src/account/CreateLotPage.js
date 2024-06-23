import React, { useState, useEffect } from 'react';
import { Box, Button, Stepper, Step, StepLabel, TextField, Typography } from '@mui/material';
import { ProgressBar } from 'react-step-progress-bar';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import MiniMap from '../minimap/MiniMap';
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';

const CreateLotPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    capacity: '',
    price: '',
    IBAN: '',
    phone_number: '',
    weekdayOpening: null,
    weekdayClosing: null,
    weekendOpening: null,
    weekendClosing: null,
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedFormData = JSON.parse(localStorage.getItem('formData'));
    if (savedFormData) {
      setFormData(savedFormData);
    }
  }, []);

  const saveFormDataToLocalStorage = (data) => {
    localStorage.setItem('formData', JSON.stringify(data));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        token: localStorage.getItem("access_token"),
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity, 10),
        iban: formData.IBAN,
        phone_number: formData.phone,
        weekday_opening_time: formData.weekdayOpening,
        weekday_closing_time: formData.weekdayClosing,
        weekend_opening_time: formData.weekendOpening,
        weekend_closing_time: formData.weekendClosing,
        street_address: formData.address,
      };
      console.log(payload)
      const response = await fetch('http://127.0.0.1:8000/parking/user-parking/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Form submitted successfully!');

        setFormData({
          capacity: '',
          price: '',
          IBAN: '',
          phone: '',
        });
        localStorage.removeItem('formData');
        navigate("/account");
      } else {
        const errorData = await response.json();
        alert(`Form submission failed: ${errorData.message}`);
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form. Please try again.');
      setIsSubmitting(false)
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    saveFormDataToLocalStorage(newFormData);
  };

  const handleTimeChange = (field, value) => {
    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [field]: value?.format('HH:mm'),
      };
      saveFormDataToLocalStorage(newData);
      return newData;
    });
  };

  const handleMiniMapAddressChange = (address) => {
    console.log(address)
    setFormData((prevData) => {
      const newData = {
        ...prevData,
        address: address,
      };
      saveFormDataToLocalStorage(newData);
      return newData;
    });
  };

  const steps = ['Capacity & Price', 'IBAN', 'Phone Number', 'Operating Hours', 'Address', 'Summary'];

  const getStepText = () => {
    switch (activeStep) {
      case 0:
        return 'Enter Capacity and Price';
      case 1:
        return 'Enter IBAN';
      case 2:
        return 'Enter Phone Number';
      case 3:
        return 'Choose Operating Hours';
      case 4:
          return 'Choose Address';
      case 5:
        return 'Review and Submit';
      default:
        return '';
    }
  };

  const boxHeight =
  activeStep === 3 ? '500px' :
  activeStep === 4 ? '800px' :
  activeStep === 5 ? '550px' : '400px';

  return (
    <div style={{ display: 'flex', margin: '0', justifyContent: 'center', background: 'grey', minHeight: '20vh' }}>
      <Box
        sx={{
          position: 'relative',
          background: 'snow',
          padding: '40px',
          marginTop: '200px',
          marginBottom: '200px',
          width: '100%',
          '@media (min-width: 600px)': {
            width: '70%',
          },
          height: boxHeight,
          border: '2px solid black',
          borderRadius: '25px',
          boxSizing: 'border-box',
        }}
      >
        <ProgressBar percent={(activeStep / (steps.length - 1)) * 100} filledBackground="#4caf50" />

        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Typography variant="h4" gutterBottom style={{ marginTop: '30px', marginBottom: '30px' }}>
          {getStepText()}
        </Typography>

        <Box flexDirection="column" alignItems="center">
          {activeStep === steps.length ? (
            <Box>
              <Box>All steps completed - you're finished</Box>
              <Button onClick={handleSubmit}>Submit</Button>
            </Box>
          ) : (
            <Box>
              {activeStep === 0 && (
                <div>
                  <TextField
                    label="Capacity"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    fullWidth
                    style={{ width: '80%', marginBottom: '10px' }}
                    required
                  />
                  <TextField
                    label="Price"
                    name="price"
                    type="number"
                    step="0.1"
                    value={formData.price}
                    onChange={handleInputChange}
                    fullWidth
                    style={{ width: '80%', marginBottom: '10px' }}
                    required
                  />
                  <Box>
                    <Button onClick={handleNext}>Next</Button>
                  </Box>
                </div>
              )}
              {activeStep === 1 && (
                <div>
                  <TextField
                    label="IBAN"
                    name="IBAN"
                    value={formData.IBAN}
                    onChange={handleInputChange}
                    fullWidth
                    style={{ width: '80%', marginBottom: '10px' }}
                    required
                  />
                  <Box>
                    <Button onClick={handleBack}>Previous</Button>
                    <Button onClick={handleNext}>Next</Button>
                  </Box>
                </div>
              )}
              {activeStep === 2 && (
                 <div>
                 <PhoneInput
                   defaultCountry="ro"
                   value={formData.phone}
                   onChange={(phone) => handleInputChange({ target: { name: 'phone', value: phone } })}
                 />
                 <Box>
                   <Button onClick={handleBack}>Previous</Button>
                   <Button onClick={handleNext}>
                     Next
                   </Button>
                 </Box>
               </div>
              )}
              {activeStep === 3 && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div>
                <Typography variant="h6" gutterBottom>
                  Weekday Timings
                </Typography>
                <TimePicker
                  label="Opening Time"
                  value={formData.weekdayOpening ? dayjs(formData.weekdayOpening, 'HH:mm') : null}
                  onChange={(value) => handleTimeChange('weekdayOpening', value)}
                />
                <TimePicker
                  label="Closing Time"
                  value={formData.weekdayClosing ? dayjs(formData.weekdayClosing, 'HH:mm') : null}
                  onChange={(value) => handleTimeChange('weekdayClosing', value)}
                />

                <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
                  Weekend Timings
                </Typography>
                <TimePicker
                  label="Opening Time"
                  value={formData.weekendOpening ? dayjs(formData.weekendOpening, 'HH:mm') : null}
                  onChange={(value) => handleTimeChange('weekendOpening', value)}
                />
                <TimePicker
                  label="Closing Time"
                  value={formData.weekendClosing ? dayjs(formData.weekendClosing, 'HH:mm') : null}
                  onChange={(value) => handleTimeChange('weekendClosing', value)}
                />

                <Box>
                  <Button onClick={handleBack}>Previous</Button>
                  <Button onClick={handleNext}>Next</Button>
                </Box>
              </div>
              </LocalizationProvider>
              )}
              {activeStep === 4 && (
                 <div>
                   <MiniMap onAddressChange={handleMiniMapAddressChange}/>
                 <Box>
                   <Button onClick={handleBack}>Previous</Button>
                   <Button onClick={handleNext}>Next</Button>
                 </Box>
               </div>
              )}
              {activeStep === 5 && (
                <div>
                  <Typography variant="h6" gutterBottom>
                    Summary:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Capacity: {formData.capacity}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Price: {formData.price}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    IBAN: {formData.IBAN}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Phone Number: {formData.phone}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Weekday Program: {formData.weekdayOpening} - {formData.weekdayClosing}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Weekend Program: {formData.weekendOpening} - {formData.weekendClosing}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Address: {formData.address}
                  </Typography>
                  <Box>
                    <Button onClick={handleBack}>Previous</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                  </Box>
                </div>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default CreateLotPage;
