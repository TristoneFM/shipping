'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';


const DockContent = () => {
  const [dockNumber, setDockNumber] = useState(null); // Start with null to avoid hydration mismatch
  const [dockCode, setDockCode] = useState('');
  const [dockName, setDockName] = useState([]);

  useEffect(() => {
    // Fetch dockNumber from localStorage only on the client side
    const storedDockNumber = localStorage.getItem('dockNumber') || 'NOT FOUND';
    setDockNumber(storedDockNumber);

    // Function to fetch dockCode using dockNumber
    const fetchDockCode = async () => {
      try {
        const response = await axios.post('/SHIPPING_DB/DOCK_NUMBER', { dockNumber: storedDockNumber });
        setDockCode(response.data.dock_number); // Assuming response contains { dockCode: "someDockCode" }
        setDockName(response.data.dock_name);
      } catch (error) {
        console.error('Failed to fetch dock code:', error);
      }
    };

    fetchDockCode(); // Fetch dock code on mount

    // Set up interval to fetch dock code every 60 seconds
    const intervalId = setInterval(fetchDockCode, 180000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' // Center vertically and horizontally
      }}
    >
      <Card sx={{ maxWidth: 400, textAlign: 'center', p: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {dockName}
          </Typography>

          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <QRCodeSVG value={dockCode} size={200} /> {/* Dynamic QR code */}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DockContent;
