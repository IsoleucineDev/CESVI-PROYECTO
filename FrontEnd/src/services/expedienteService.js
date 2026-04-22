import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

// Function to get expediente by id
export const getExpediente = async (id) => {
    try {
        const { data } = await http.get(`${API_PREFIX}/siniestros/${id}`);
        return data;
    } catch (error) {
        throw new Error('Error fetching expediente data');
    }
};