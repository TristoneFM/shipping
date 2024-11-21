'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDelivery } from '../../context/DeliveryContext'; 
import axiosInstance from '@/app/utils/axiosInstance';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  CssBaseline,
  Avatar,
  Alert,
  FormControlLabel,
  Switch,
  Paper,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import OverlaySpinner from '../shared/OverlaySpinner';
;

export default function Login() {
  const [isAdmin, setIsAdmin] = useState(false); // Default: Employee role
  const [username, setUsername] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const { setEmployee, setRole } = useDelivery(); // Use context

  const router = useRouter(); // Initialize the router

  const handleRoleSwitch = (event) => {
    setIsAdmin(event.target.checked);
    setUsername('');
    setEmployeeId('');
    setPassword('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    if (isAdmin) {
      axios.post('/SHIPPING_AD/AUTHENTICATE', { username, password }).then((response) => {
        setLoading(false);
        if (response.data.authorization === 'Authorized') {
          setEmployee(username.toLowerCase());
          setRole('admin');
          router.push('/dashboard');
        } else {
          toast.error('Invalid credentials.');
          setUsername('');
          setPassword('');
        }
      }).catch((error) => {
        setLoading(false);
        toast.error(error);
      });
    } else if (!isAdmin) {
      axios.post('/SHIPPING_RFC/ZEMPMAST', { employeeId }).then((response) => {
        setLoading(false);
        if (response.data.DATA.length > 0) {
          setEmployee(employeeId); 
          setRole('employee');
          router.push('/dashboard'); 
        } else {
          setEmployeeId('');
          toast.error('Invalid credentials.');
        }
      }).catch((error) => {
        setEmployeeId('');
        toast.error(error);
      });
    } else {
      toast.error('Invalid credentials.');
    }
  };

  return (
    <>
      <OverlaySpinner loading={loading} /> 
      <div className="App">
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Paper elevation={3} sx={{ padding: 3, marginTop: 8 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 0, bgcolor: 'white', width: 100, height: 100 }}>
                <img 
                  src="/forkliftt.png" 
                  alt="Avatar" 
                  style={{ width: '85%', height: '85%', objectFit: 'cover', borderRadius: '0%' }} 
                />
              </Avatar>

              <FormControlLabel
                control={
                  <Switch
                    checked={isAdmin}
                    onChange={handleRoleSwitch}
                    color="primary"
                  />
                }
                label={isAdmin ? 'Admin' : 'Employee'}
                sx={{ mt: 2 }}
              />

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <Box sx={{ mb: 2 }}>
                  {isAdmin ? (
                    <TextField
                      fullWidth
                      required
                      id="username"
                      label="Username"
                      name="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      required
                      id="employeeId"
                      label="Employee ID"
                      name="employeeId"
                      autoComplete="employee-id"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                  )}
                </Box>

                {isAdmin && (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      required
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Box>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </div>
    </>
  );
}
