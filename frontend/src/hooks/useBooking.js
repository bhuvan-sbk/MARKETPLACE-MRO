// src/hooks/useBooking.js
import { useState } from 'react';
import api from '../services/api';

export const useBooking = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createBooking = async (bookingData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/bookings', bookingData);
            return response.data;
        } catch (error) {
            const errorMessage = 
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Failed to create booking';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getBookings = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/bookings');
            return response.data;
        } catch (error) {
            setError('Failed to fetch bookings');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        createBooking,
        getBookings,
        loading,
        error
    };
};