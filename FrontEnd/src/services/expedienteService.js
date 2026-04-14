// expedienteService.js

import axios from 'axios';

const API_URL = 'https://api.gemini.example.com/'; // Replace with actual API URL

// Function to get expediente by id
export const getExpediente = async (id) => {
    try {
        const response = await axios.get(`${API_URL}expedientes/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching expediente data');
    }
};

// Other service functions can be added here