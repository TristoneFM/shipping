
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AXIOS,
  timeout: 300000, 
});

export default axiosInstance;
