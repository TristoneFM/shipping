'use client';
import React, { useState, useEffect } from 'react';
import { TextField, Button, Paper, Box, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import OverlaySpinner from '../shared/OverlaySpinner';
import { useDelivery } from '@/app/context/DeliveryContext';
import axiosInstance from '@/app/utils/axiosInstance';

const ProgramContent = () => {
  const { selectedDelivery, employee } = useDelivery();

  const [formData, setFormData] = useState({
    shipment: '',
    delivery: '',
    dock: '',
    employee: employee || '' // Initialize with context employee if available
  });

  const [loading, setLoading] = useState(false);
  const [docks, setDocks] = useState([]);

  useEffect(() => {
    // Fetch docks from the API
    axios.get('/SHIPPING_DB/DOCKS')
      .then(response => {
        setDocks(response.data);
      })
      .catch(error => {
        toast.error('Failed to fetch docks');
      });
  }, []);

  useEffect(() => {
    // Update formData.employee whenever employee from context changes
    setFormData((prevData) => ({
      ...prevData,
      employee: employee || ''
    }));
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation for the "delivery" field: allow only numbers and commas
    if (name === "delivery") {
      const isValid = /^[0-9,]*$/.test(value); // Regex to allow only numbers and commas
      if (!isValid) {
        toast.error("Delivery number must contain only numbers if multiple, separated by commas");
        return; // Exit the function if input is invalid
      }
    }

    if (name === "shipment") {
      const uppercasedValue = value.toUpperCase(); // Convert to uppercase
      const isValid = /^[A-Z0-9 ]*$/.test(uppercasedValue); // Regex to allow only uppercase letters, numbers, and spaces
      if (!isValid) {
        toast.error("Shipment must contain only letters and numbers");
        return; // Exit the function if input is invalid
      }
  
      // Set the uppercase value in the form data
      setFormData((prevData) => ({
        ...prevData,
        [name]: uppercasedValue,
      }));
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  
  const handleSubmit = async (e) => {
    
    e.preventDefault();
    setLoading(true);

    const resetForm = () => {
      setFormData({
        shipment: '',
        delivery: '',
        dock: '',
        employee: employee || '' // Reset with the current employee value from context
      });
    };


    try {
      const response = await axios.post('/SHIPPING_RFC/DELIVERY', formData);

      if (response.data.error && response.data.error !== 'N/A') {
        toast.error(response.data.error);
        resetForm();
      } else {
        toast.success('Shipment scheduled successfully');
        resetForm();
      }
    } catch (error) {
        toast.info('Processing request is taking longer than expected. Please wait...');
        resetForm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <OverlaySpinner loading={loading} /> 
      
      <Paper
        elevation={3}
        sx={{ maxWidth: 400, margin: 'auto', marginTop: 4, padding: 3, marginBottom: 4 }}
      >
        <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
          Programa Shipment
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Name"
            name="shipment"
            value={formData.shipment}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            required
          />
          <TextField
            label="Delivery Number"
            name="delivery"
            value={formData.delivery}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            required
          />

          <FormControl fullWidth required>
            <InputLabel id="dock-label">Dock</InputLabel>
            <Select
              labelId="dock-label"
              name="dock"
              value={formData.dock}
              onChange={handleChange}
            >
              {docks.map((dock, index) => (
                <MenuItem key={index} value={dock.id}>
                  {dock.dock_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            Guardar
          </Button>
        </Box>

      </Paper>
    </>
  );
};

export default ProgramContent;
