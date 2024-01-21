import '../homepage/index.css';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const MyAccountPage = () => {
    const [userData, setUserData] = useState({});
    const { register, handleSubmit, setValue } = useForm();
  
    useEffect(() => {
      // Fetch user data when the component mounts
      const fetchUserData = async () => {
        try {
            const access_token = localStorage.getItem("access_token")
          const response = await fetch('http://localhost:8000/account/user', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                // 'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
              },
            // credentials: 'include',
            body: JSON.stringify({
                token: access_token,
            }),
          });
  
          console.error(response.data)
          setUserData(response.data);
          
          // Set initial form values using setValue from react-hook-form
          Object.keys(response.data).forEach(key => {
            setValue(key, response.data[key]);
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
  
      fetchUserData();
    }, []);
  
    const onSubmit = async (data) => {
      try {
        // Make a request to update user info
        const response = await axios.patch('http://localhost:8000/account/info', data, {
          withCredentials: true, // Include cookies in the request
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
  
        console.log('User data updated:', response.data);
        // Optionally, update the local state or trigger a refetch of user data
      } catch (error) {
        console.error('Error updating user data:', error);
      }
    };
  
    return (
      <div className='overflow-hidden flex flex-col min-h-screen'>
        {/* Display User Data */}
        <div>
          <h2>User Information</h2>
          {/* Add more fields as needed */}
        </div>
  
        {/* Edit Form */}
        <div>
          <h2>Edit User Information</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor='username'>Username:</label>
            <input {...register('username')} id='username' />
  
            <label htmlFor='email'>Email:</label>
            <input {...register('email')} id='email' />
  
            {/* Add more fields as needed */}
  
            <button type='submit'>Save Changes</button>
          </form>
        </div>
      </div>
    );
}

export default MyAccountPage;