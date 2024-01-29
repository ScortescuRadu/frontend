import React, { useState, useEffect } from 'react';
import { Box, Button, Stepper, Step, StepLabel, TextField, Typography } from '@mui/material';
import { ProgressBar } from 'react-step-progress-bar';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import MiniMap from '../minimap/MiniMap';

const CreateLotPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    capacity: '',
    price: '',
    IBAN: '',
  });

  useEffect(() => {
    // Load form data from localStorage on component mount
    const savedFormData = JSON.parse(localStorage.getItem('formData'));
    if (savedFormData) {
      setFormData(savedFormData);
    }
  }, []);

  const saveFormDataToLocalStorage = (data) => {
    // Save form data to localStorage
    localStorage.setItem('formData', JSON.stringify(data));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    // Handle form submission logic here
    alert('Form submitted successfully!');
    // Optionally, you can clear the form data and localStorage after submission
    setFormData({
      capacity: '',
      price: '',
      IBAN: '',
      phone: '',
    });
    localStorage.removeItem('formData');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    // Save form data to localStorage on each input change
    saveFormDataToLocalStorage(newFormData);
  };

  const handleTimeChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
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
  activeStep === 4 ? '800px' : '400px';

  return (
    <div style={{ display: 'flex', margin: '0', justifyContent: 'center', background: 'grey', minHeight: '20vh' }}>
      <Box
        sx={{
          position: 'relative',
          background: 'snow',
          padding: '40px',
          marginTop: '45px',
          marginBottom: '45px',
          width: '100%',
          '@media (min-width: 600px)': {
            width: '70%',
          },
          height: boxHeight,
          border: '2px solid black',
          borderRadius: '25px',
          boxSizing: 'border-box', // Add this to include padding in width calculation
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
                  value={formData.weekdayOpening}
                  onChange={(value) => handleTimeChange('weekdayOpening', value)}
                />
                <TimePicker
                  label="Closing Time"
                  value={formData.weekdayClosing}
                  onChange={(value) => handleTimeChange('weekdayClosing', value)}
                />

                <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
                  Weekend Timings
                </Typography>
                <TimePicker
                  label="Opening Time"
                  value={formData.weekendOpening}
                  onChange={(value) => handleTimeChange('weekendOpening', value)}
                />
                <TimePicker
                  label="Closing Time"
                  value={formData.weekendClosing}
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
                   <MiniMap />
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
