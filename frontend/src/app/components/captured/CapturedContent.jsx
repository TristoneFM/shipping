import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Card, IconButton, Modal, Typography, Table, TableBody, TableCell, TableRow, TableContainer, Paper, TablePagination } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { toast } from 'react-toastify';
import axios from 'axios';

function EditToolbar() {
  return (
    <GridToolbarContainer>
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <GridToolbarQuickFilter />
      </Box>
    </GridToolbarContainer>
  );
}

export default function ToolsTable() {
  const [rows, setRows] = useState([]);
  const [labels, setLabels] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [openLabelModal, setOpenLabelModal] = useState(false);
  const [openPictureModal, setOpenPictureModal] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Pagination state for DataGrid and Labels Modal
  const [pageSize, setPageSize] = useState(5);
  const [labelPage, setLabelPage] = useState(0);
  const [labelRowsPerPage, setLabelRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await axios.get('/SHIPPING_DB/CLOSED_SHIPMENTS');
        setRows(response.data);
      } catch (err) {
        toast.error(err.message, { theme: 'colored' });
      }
    };
    fetchShipments();

        // Fetch every minute
    const intervalId = setInterval(fetchShipments, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (openLabelModal && selectedShipment) {
      const fetchLabels = async () => {
        try {
          const response = await axios.post('/SHIPPING_DB/SCANNED_LABELS', { selectedShipment });
          setLabels(response.data);
        } catch (err) {
          toast.error("Failed to fetch labels", { theme: 'colored' });
        }
      };
      fetchLabels();
    }
  }, [openLabelModal, selectedShipment]);

  const handlePictureClick = async (deliveryId) => {
    try {
      const response = await axios.post(
        '/SHIPPING_DB/IMAGE',
        { deliveryId },
        { responseType: 'blob' }
      );
      const imageURL = URL.createObjectURL(response.data);
      setSelectedPicture(imageURL);
      setSelectedShipment(deliveryId)
      setOpenPictureModal(true);
    } catch (error) {
      toast.error("Failed to fetch picture", { theme: 'colored' });
    }
  };

  const columns = [
    { field: 'shipping_name', headerName: 'Shipment', minWidth: 100, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'shipping_delivery', headerName: 'Delivery', minWidth: 100, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'shipping_captured_date', headerName: 'Date', minWidth: 100, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'shipping_admin', headerName: 'Admin', minWidth: 100, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'shipping_employee', headerName: 'Employee', minWidth: 100, flex: 1, align: 'center', headerAlign: 'center' },
    {
      field: 'labels',
      headerName: 'Labels',
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => {
            setSelectedShipment(params.row.id);
            setOpenLabelModal(true);
          }}
        >
          <InfoOutlinedIcon />
        </IconButton>
      ),
    },
    {
      field: 'picture',
      headerName: 'Picture',
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => handlePictureClick(params.row.id)}
        >
          <ImageOutlinedIcon />
        </IconButton>
      ),
    },
  ];

  const handleLabelPageChange = (event, newPage) => {
    setLabelPage(newPage);
  };

  const handleLabelRowsPerPageChange = (event) => {
    setLabelRowsPerPage(parseInt(event.target.value, 10));
    setLabelPage(0);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', padding: 2, boxSizing: 'border-box' }}>
      <Card variant="outlined" sx={{ width: '100%', height: '100%', borderRadius: '15px', padding: '10px', boxSizing: 'border-box' }}>
        <Box sx={{ height: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            editMode="row"
            sx={{ border: 0 }}
            rowModesModel={rowModesModel}
            onRowSelectionModelChange={(newRowSelectionModel) => setRowSelectionModel(newRowSelectionModel)}
            rowSelectionModel={rowSelectionModel}
            pagination
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            pageSizeOptions={[5, 10, 20]}
            slots={{
              toolbar: EditToolbar,
            }}
          />
        </Box>
      </Card>

      {/* Labels Modal */}
      <Modal open={openLabelModal} onClose={() => setOpenLabelModal(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
              {/* Modal Header */}
            <Typography variant="h6" align="center" gutterBottom>
              {rows.find((row) => row.id === selectedShipment)?.shipping_name || 'N/A'}
            </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 300, overflow: 'auto' }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell align="center"><strong>Master Label</strong></TableCell>
                  <TableCell align="center"><strong>Single Label</strong></TableCell>
                </TableRow>
                {labels.slice(labelPage * labelRowsPerPage, labelPage * labelRowsPerPage + labelRowsPerPage).map((label, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{label.shipping_master}</TableCell>
                    <TableCell align="center">{label.shipping_single}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={labels.length}
            page={labelPage}
            onPageChange={handleLabelPageChange}
            rowsPerPage={labelRowsPerPage}
            onRowsPerPageChange={handleLabelRowsPerPageChange}
          />
        </Box>
      </Modal>

      {/* Picture Modal */}
      <Modal open={openPictureModal} onClose={() => setOpenPictureModal(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
        <Typography variant="h6" align="center" gutterBottom>
      {rows.find((row) => row.id === selectedShipment)?.shipping_name || 'N/A'}
    </Typography>
          {selectedPicture ? (
            <img src={selectedPicture} alt="Selected" style={{ width: '100%', borderRadius: 8 }} />
          ) : (
            <Typography align="center">No Picture Available</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
