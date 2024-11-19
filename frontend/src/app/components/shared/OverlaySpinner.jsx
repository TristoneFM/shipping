// OverlaySpinner.js
import React from 'react';
import { ClimbingBoxLoader } from 'react-spinners';
import { Box } from '@mui/material';

const OverlaySpinner = ({ loading }) => {
  if (!loading) return null; // Only render when loading is true

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent backdrop
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300, // Ensure it overlays other content
      }}
    >
      <ClimbingBoxLoader size={20} color="#ffffff" />
    </Box>
  );
};

export default OverlaySpinner;
