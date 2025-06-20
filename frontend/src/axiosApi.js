import axios from 'axios';
import {API_URL} from "./constants";

const axiosApi = axios.create({
  baseURL: API_URL,
});

export const addInterceptors = (store) => {
  axiosApi.interceptors.request.use((config) => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      config.headers.set('Authorization', `Bearer ${jwtToken}`);
    }

    return config;
  });
};

export default axiosApi;
