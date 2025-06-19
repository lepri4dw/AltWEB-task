import axios from 'axios';
import {apiURL} from "./constants";

const axiosApi = axios.create({
  baseURL: apiURL,
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
