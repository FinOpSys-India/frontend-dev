import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { apiEndPointUrl } from '../utils/apiService';

const RedirectIfAuthenticated = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const token = localStorage.getItem('authToken');  // Retrieve token from storage

  axios.defaults.withCredentials = true;
  
  const checkAuth = () => {
    axios.get(`${apiEndPointUrl}/`,{
      headers: {
        Authorization: `Bearer ${token}`  // Set Bearer token in Authorization header
      }
    }) // Adjust the endpoint accordingly
      .then(res => {

          console.log(res)
        if (res.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch((err) => {

          console.log(err)
        setIsAuthenticated(false);
      });
  };

  useEffect(() => {
    checkAuth();
  }, []);


  if (isAuthenticated === null) {
    return <div>Loading...</div>; // or any loading indicator
  }

  return isAuthenticated ? <Navigate to="/" /> : children;
};

export default RedirectIfAuthenticated;
