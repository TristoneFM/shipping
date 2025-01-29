import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Webcam from 'react-webcam';
import { useRouter } from 'next/navigation';
import { useDelivery } from '../../context/DeliveryContext'; 
import axios from 'axios';
import { toast } from 'react-toastify';
import { CameraAlt, PhotoCamera } from '@mui/icons-material'; // Import camera icons
import IconButton from '@mui/material/IconButton'; // Import IconButton from MUI
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

// Define a constant to control whether the dock confirmation modal appears
const ENABLE_DOCK_CONFIRMATION = false;
const numberofScans = 10; // Number of scans before dock confirmation

const videoConstraints = {
  width: 300,
  height: 300,
  facingMode: 'environment',
};

const CaptureContent = () => {
  const [firstScan, setFirstScan] = useState('');
  const [secondScan, setSecondScan] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openSecondScanModal, setOpenSecondScanModal] = useState(false); // New state
  const [boxNumber, setBoxNumber] = useState('');
  const [isPictureCaptured, setIsPictureCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const router = useRouter();
  const { selectedDelivery, employee } = useDelivery();
  const [deliveryData, setDeliveryData] = useState([]);
  const [capturedData, setCapturedData] = useState(null);
  const secondScanInputRef = useRef(null);
  const masterScanInputRef = useRef(null);
  const boxScanInputRef = useRef(null);
  const webcamRef = useRef(null);
  const [openDockModal, setOpenDockModal] = useState(false);
  const [dockNumber, setDockNumber] = useState(''); // Dock number state
  const dockNumberInputRef = useRef(null);
  const [scanCounter, setScanCounter] = useState(0); // Counter to track scans
  const [locationScan, setLocationScan] = useState(''); // NEW: State for scanned location
  const [location, setLocation] = useState(''); // Existing state to store location from backend
  const [openLocationModal, setOpenLocationModal] = useState(false); // NEW: State to manage location modal visibility
  const locationScanInputRef = useRef(null); // NEW: Ref for location scan input
  

  useEffect(() => {
    
    if (!selectedDelivery) {
      router.push('/dashboard');
    } else {
      axios.post('/SHIPPING_DB/SELECTED_DELIVERY', { selectedDelivery }).then((response) => {
        
        setDeliveryData(response.data.delivery);
        setCapturedData(response.data.captured);
        setLocation(response.data.captured[0].shipping_location);
        

        if (ENABLE_DOCK_CONFIRMATION) {
          setOpenDockModal(true);
        }
      });
    }
    

   
  }, []);

  useEffect(() => {
    if (deliveryData.length === 0) return; // Avoid running logic on empty data
    const closeShipment = deliveryData.every(
      element => element.shipping_captured === 'true'
    );

    setOpenModal(closeShipment);

  }, [deliveryData]);
  

  useEffect(() => {

      setTimeout(() => {
        if (openModal) {
        boxScanInputRef?.current?.focus(); // Focus the box number input when modal opens
      }else if(!openModal && !openDockModal && !openSecondScanModal){
        masterScanInputRef?.current?.focus(); // Focus the first scan input on load
      }
      }, 200);
   
  }, [openModal]);

    // Focus the input when the second scan modal opens
    useEffect(() => {
      setTimeout(() => {
        if (openLocationModal) {
          locationScanInputRef?.current?.focus(); // Focus location scan input
        } else if (openSecondScanModal) {
          secondScanInputRef?.current?.focus(); // Focus second scan input
        } else {
          masterScanInputRef?.current?.focus(); // Default focus on master scan input
        }
      }, 200);
    }, [openLocationModal, openSecondScanModal]);
    


    useEffect(() => {

        setTimeout(() => {
          if (openDockModal) {
          dockNumberInputRef?.current?.focus();
        }else if(!openModal && !openDockModal && !openSecondScanModal){
          masterScanInputRef?.current?.focus(); // Focus the first scan input on load
        }
        }, 200); // Adjust the timeout value if needed
      
      
    }, [openDockModal]);

  const handleFirstScanChange = (event) => {
    setFirstScan(event.target.value);
  };

  const handleFirstScanEnter = (event) => {
    if (event.key !== 'Enter' || !firstScan) return;
  
    const scannedItem = deliveryData.find((item) => item.shipping_master === firstScan.substring(1));
  
    if (!scannedItem) {
      setFirstScan('');
      toast.error('Master label not found');
      return;
    }
  
    if (scannedItem.shipping_captured === 'true') {
      setFirstScan('');
      toast.warning('Master label already scanned');
      return;
    }
  
    if (location) { // NEW: Check if location is required
      setOpenLocationModal(true); // Open location modal
    } else {
      setOpenSecondScanModal(true); // Proceed to second scan modal if no location required
    }
  };
  

  const handleSecondScanChange = (event) => {
    setSecondScan(event.target.value);
  };

  const handleSecondScanEnter = (event) => {

    
    if (event.key === 'Enter' && secondScan) {
      const modifiedFirstScan = firstScan.substring(1);
      const modifiedSecondScan = secondScan.substring(1);
      axios.post('/SHIPPING_DB/CONFIRM_LABEL', {selectedDelivery, firstScan:modifiedFirstScan , secondScan:modifiedSecondScan  }).then((response) => {
        
       if (response.data.updateResult.affectedRows === 1) {
          setFirstScan('');
          setSecondScan('');
          setOpenSecondScanModal(false);
          setDeliveryData(response.data.deliveryData.delivery);

        // Increment scan counter and open dock modal only if enabled
        if (ENABLE_DOCK_CONFIRMATION) {
          setScanCounter((prevCounter) => {
            const newCounter = prevCounter + 1;
            if (newCounter >= numberofScans) {
              setOpenDockModal(true); // Open dock modal every 3rd successful second scan
              return 0; // Reset counter after showing the dock modal
            }
            return newCounter;
          });
        }

        }else {
          
          toast.error('Single label HU not found');
          setSecondScan('');
        }
        
      });
    }
  };

  const handleBoxNumberChange = (event) => {
    setBoxNumber(event.target.value);
  };

// Function to handle taking the picture only
const handleTakePicture = () => {
  if (webcamRef.current) {
    const imageSrc = webcamRef.current.getScreenshot(); // Capture the image
    setCapturedImage(imageSrc); // Save the captured image
    setIsPictureCaptured(true); // Mark the picture as captured
    toast.success('Picture captured successfully'); // Optional feedback
  }
};

// Function to remove the captured picture and allow retake
const handleRemovePicture = () => {
  setCapturedImage(null); // Clear the captured image
  setIsPictureCaptured(false); // Reset picture captured state
  toast.info('Picture removed. You can retake it.');
};

// Function to send the captured picture and box number to the backend
const handleSendData = async () => {
  if (!capturedImage || !boxNumber) {
    toast.error('Please capture a picture and enter the box number');
    return;
  }

  
  try {
    const response = await axios.post('/SHIPPING_DB/SAVE_IMAGE', {
      image: capturedImage,
      deliveryId: selectedDelivery,
      boxNumber,
      employee,
    });

    if (response.status === 200) {
      toast.success('Shipment closed successfully');
      setBoxNumber('');
      setOpenModal(false);
      router.push('/dashboard');
    } else {
      toast.error('Failed to close shipment');
    }
  } catch (error) {
    toast.error('An error occurred while closing the shipment');
  }
};
  


  const handleCancelSecondScan = () => {
    setOpenSecondScanModal(false);  // Close the modal
    setFirstScan('');               // Clear the first scan input
    setSecondScan('');              // Clear the second scan input
  };

  // Dock modal confirm logic
  const handleDockNumberChange = (event) => {
    setDockNumber(event.target.value);
  };

  const handleDockNumberEnter = (event) => {
    if (event.key === 'Enter') {


      axios.post('/SHIPPING_DB/CHECK_DOCK', { selectedDelivery, dockNumber }).then((response) => {

        if (response.data.message === undefined) {
          toast.error('Dock number does not match');
          setDockNumber('');
        }else{
          toast.success('Dock number verified');
          setDockNumber('');
          setOpenDockModal(false);


        }        
      });
    }
  };

  const handleLocationScanChange = (event) => {
    setLocationScan(event.target.value); // Update location scan state
  };
  
  const handleLocationScanEnter = (event) => {
    if (event.key === 'Enter' && locationScan) {
      let updatedLocationScan = locationScan;
       
        if (locationScan.length === 8) {
          updatedLocationScan = locationScan.slice(0, -1); // Remove the last character
          setLocationScan(updatedLocationScan); // Update state
      }

        // Check if locationScan matches the location or has a valid '1L' prefix
        if (updatedLocationScan  === location || updatedLocationScan  === `1L${location}`) {
            toast.success('Location verified');
            setLocationScan('');
            setOpenLocationModal(false); // Close location modal
            setOpenSecondScanModal(true); // Open second scan modal
        } else {
            toast.error('Incorrect location'); // Error if location doesn't match
            setLocationScan('');
        }
    }
  };

  
  

  return (
   
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {capturedData && capturedData[0].shipping_name}
      </Typography>

      <TextField
        label="Master Label"
        variant="outlined"
        value={firstScan}
        onChange={handleFirstScanChange}
        onKeyDown={handleFirstScanEnter} // Trigger modal on Enter key
        fullWidth
        sx={{ mb: 2 }}
        inputRef={masterScanInputRef} // Assign the ref to this input field
      />

      <Typography variant="h5" gutterBottom mt={2}>
        Master Labels
      </Typography>

      <Grid container spacing={2}>
        {deliveryData.map((item) => (
          <Grid key={item.shipping_master}>
            <Chip
              label={item.shipping_master}
              sx={{
                backgroundColor: item.shipping_captured === 'true' ? 'lightgreen' : 'lightgray',
                color: 'black',
                fontWeight: item.shipping_captured === 'true' ? 'bold' : 'normal',
              }}
            />
          </Grid>
        ))}
      </Grid>
 

           {/* New Modal for Dock Confirmation */}
           <Dialog open={openDockModal} disableEscapeKeyDown>
        <DialogTitle>Confirm Dock Number</DialogTitle>
        <DialogContent>
          <TextField
            label="Dock Number"
            variant="outlined"
            value={dockNumber}
            onChange={handleDockNumberChange}
            onKeyDown={handleDockNumberEnter} // Confirm on Enter key
            fullWidth
            inputRef={dockNumberInputRef} // A
            margin='normal'
          />
        </DialogContent>
      </Dialog>
      

      {/* Modal for Second Scan */}
      <Dialog open={openSecondScanModal}>
        <DialogTitle>Single Lable HU</DialogTitle>
        <DialogContent>
          <TextField
            label="Single Label HU"
            variant="outlined"
            value={secondScan}
            onChange={handleSecondScanChange}
            onKeyDown={handleSecondScanEnter}
            inputRef={secondScanInputRef} // Assign the ref to this input field
            fullWidth
            margin='normal'
           
          />
        </DialogContent>
        <DialogActions>
          <Button  onClick={() => handleCancelSecondScan()}  color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openLocationModal}>
        <DialogTitle>Scan Location</DialogTitle>
        <DialogContent>
          <TextField
            label="Location"
            variant="outlined"
            value={locationScan}
            onChange={handleLocationScanChange}
            onKeyDown={handleLocationScanEnter}
            inputRef={locationScanInputRef} // Assign input ref
            fullWidth
          />
        </DialogContent>
      </Dialog>


      {/* Modal for Box Number and Picture Capture */}
      <Dialog open={openModal}>
        <DialogTitle>Close Shipment</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              width: '100%',
              height: '100%',
              textAlign: 'center',
            }}
          >
            <TextField
              label="Container Number"
              variant="outlined"
              value={boxNumber}
              onChange={handleBoxNumberChange}
              fullWidth
              sx={{ mb: 2 }}
              inputRef={boxScanInputRef} // Assign the ref to this input field
              margin='normal'
            />

            {!isPictureCaptured ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 300,
                  height: 300,
                  border: '2px solid lightgray',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: 'black',
                }}
              >
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  height="100%"
                  videoConstraints={videoConstraints}
                />
              </Box>
            ) : (
              <img src={capturedImage} alt="Captured" width={300} height={300} />
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {/* Camera Icon Button: Only Capture Picture */}
              <IconButton
                color="primary"
                onClick={handleTakePicture} // Capture picture only
                disabled={isPictureCaptured}
              >
                <PhotoCamera />
              </IconButton>

              {/* Remove Picture Button */}
              {isPictureCaptured && (
                  <IconButton
                  color="secondary"
                  onClick={handleRemovePicture} // Capture picture only
                  >
                  <HighlightOffIcon />
                  </IconButton>
              )}
            </Box>

            {/* Send Data Button: Underneath the image */}
            {isPictureCaptured && (
              <Button
                variant="contained"
                onClick={handleSendData} // Send picture + box number to backend
                fullWidth
                sx={{ mt: 2 }}
              >
                Send Data
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CaptureContent;
