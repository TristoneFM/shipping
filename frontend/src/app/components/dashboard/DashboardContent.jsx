'use client';
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton

} from '@mui/material';

import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDelivery } from '../../context/DeliveryContext';
import OverlaySpinner from '../shared/OverlaySpinner';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const DashboardContext = () => {
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const router = useRouter();
  const { setSelectedDelivery, role } = useDelivery();
  const [loading, setLoading] = useState(false);

  // States for delete confirmation modal
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  
  // Fetch deliveries data from the API
  useEffect(() => {
    setLoading(true);
    const fetchDeliveries = async () => {
      try {
        const response = await axios.get('/SHIPPING_DB/DELIVERIES');       
        setData(response.data); 
      } catch (err) {
        toast.error(err.message, { theme: 'colored' });	
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();

      // Fetch every minute
      const intervalId = setInterval(fetchDeliveries, 60000);

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
      
  }, []);

  // Handle delete action with confirmation modal
  const handleDelete = async () => {
    try {
      setLoading(true);
      const result = await axios.post(`/SHIPPING_DB/DELETE_DELIVERY`, { deliveryId: selectedDeliveryId });

      if(result.data.result.affectedRows>0){
        setData(data.filter((item) => item.id !== selectedDeliveryId));
        toast.success('Delivery deleted successfully', { theme: 'colored' });
      }else{
        toast.error('Failed to delete delivery', { theme: 'colored' });
      } 
      setOpenConfirm(false); // Close the modal after deletion
    } catch (err) {
      toast.error(err.message, { theme: 'colored' });
    } finally {
      setLoading(false);
    }
  };

  // Open confirmation modal
  const confirmDelete = (id) => {
    setSelectedDeliveryId(id);
    setOpenConfirm(true);
  };

  // Close confirmation modal
  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelect = (row) => {
    setSelectedDelivery(row.id); 
    router.push('/capture');
  };

  // Calculate the current rows to display based on pagination
  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <OverlaySpinner loading={loading} /> 

      <TableContainer component={Paper} sx={{ maxWidth: 600, margin: 'auto', marginTop: 0 }}>
        <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
          Delivery Schedule
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{width:role === 'admin'?80:2,padding: '0 4px'}}></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Delivery</TableCell>
              <TableCell>Date</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={index}>
                <TableCell align="center" sx={{width:role === 'admin'?80:2, padding: '0 0px'}}>
                <IconButton
                    color="primary"
                    onClick={() => handleSelect(row)}
                    sx={{ marginRight: 1 }}
                    aria-label="Select"
                  >
                    <CheckBoxIcon />
                  </IconButton>
                  {role === 'admin' && (
                    <IconButton
                      color="error"
                      onClick={() => confirmDelete(row.id)}
                      aria-label="Delete"
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>{row.shipping_name}</TableCell>
                <TableCell>{row.shipping_delivery}</TableCell>
                <TableCell>{row.shipping_date.split('T')[0]}</TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 15]}
        />
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this delivery? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DashboardContext;
