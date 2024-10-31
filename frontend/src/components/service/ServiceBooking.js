// src/components/services/ServiceCard.js
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Alert,
    Chip,
    Box,
    Rating,
    MenuItem
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

 
const ServiceCard = ({ service, onBookingComplete }) => {
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [bookingData, setBookingData] = useState({
        startDate: null,
        endDate: null,
        aircraft: {
            type: '',
            registrationNumber: '',
            size: 'small'
        },
        specialRequests: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { user } = useAuth();
    const navigate = useNavigate();

    const aircraftSizes = ['small', 'medium', 'large'];

    const handleBookClick = () => {
        if (!user) {
            navigate('/login', { 
                state: { from: `/services/${service._id}` }
            });
            return;
        }
        setBookingDialogOpen(true);
    };

    const handleInputChange = (field) => (value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setBookingData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setBookingData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    // src/components/services/ServiceCard.js

const handleSubmit = async () => {
    try {
        setLoading(true);
        setError('');

        // Log the complete URL and data being sent
        console.log('Making request to:', `${api.BASE_URL}/bookings`);
        console.log('With data:', {
            hangarId: service._id,
            startDate: bookingData.startDate.toISOString(),
            endDate: bookingData.endDate.toISOString(),
            aircraft: bookingData.aircraft,
            specialRequests: bookingData.specialRequests
        });

        const response = await api.post('/bookings', {
            hangarId: service._id,
            startDate: bookingData.startDate.toISOString(),
            endDate: bookingData.endDate.toISOString(),
            aircraft: {
                type: bookingData.aircraft.type,
                registrationNumber: bookingData.aircraft.registrationNumber,
                size: bookingData.aircraft.size
            },
            specialRequests: bookingData.specialRequests
        });

        console.log('Booking response:', response.data);

        if (response.data) {
            // Show success message
            console.log('Booking successful:', response.data);
            
            if (onBookingComplete) {
                onBookingComplete(response.data);
            }
            
            setBookingDialogOpen(false);
            // Reset form
            setBookingData({
                startDate: null,
                endDate: null,
                aircraft: {
                    type: '',
                    registrationNumber: '',
                    size: 'small'
                },
                specialRequests: ''
            });
        }
    } catch (error) {
        console.error('Complete error object:', error);
        console.error('Error response:', error.response);
        console.error('Error request:', error.request);
        setError(
            error.response?.data?.message || 
            error.response?.data?.error || 
            'Failed to create booking. Please try again.'
        );
    } finally {
        setLoading(false);
    }
};

    const calculateEstimatedPrice = () => {
        if (!bookingData.startDate || !bookingData.endDate || !service.pricePerDay) {
            return 0;
        }
        const days = Math.ceil(
            (new Date(bookingData.endDate) - new Date(bookingData.startDate)) / 
            (1000 * 60 * 60 * 24)
        );
        return (days * service.pricePerDay).toFixed(2);
    };

    return (
        <>
            <Card>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                        {service.name}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Chip 
                            label={service.category} 
                            color="primary" 
                            size="small" 
                        />
                    </Box>

                    <Typography color="textSecondary" gutterBottom>
                        {service.description}
                    </Typography>

                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Rating value={service.rating?.average || 0} readOnly />
                        <Typography variant="body2" color="textSecondary">
                            ({service.rating?.count || 0} reviews)
                        </Typography>
                    </Box>

                    <Typography variant="h6" sx={{ mt: 2 }}>
                        ${service.pricePerDay} per day
                    </Typography>
                </CardContent>

                <CardActions>
                    <Button 
                        size="large" 
                        variant="contained" 
                        fullWidth
                        onClick={handleBookClick}
                    >
                        Book Now
                    </Button>
                </CardActions>
            </Card>

            <Dialog 
                open={bookingDialogOpen} 
                onClose={() => setBookingDialogOpen(false)}
                maxWidth="sm" 
                fullWidth
            >
                <DialogTitle>Book {service?.name}</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Grid item xs={12} sm={6}>
                                <DateTimePicker
                                    label="Start Date & Time"
                                    value={bookingData.startDate}
                                    onChange={handleInputChange('startDate')}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    minDate={new Date()}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DateTimePicker
                                    label="End Date & Time"
                                    value={bookingData.endDate}
                                    onChange={handleInputChange('endDate')}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    minDate={bookingData.startDate || new Date()}
                                />
                            </Grid>
                        </LocalizationProvider>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Aircraft Type"
                                value={bookingData.aircraft.type}
                                onChange={(e) => handleInputChange('aircraft.type')(e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Registration Number"
                                value={bookingData.aircraft.registrationNumber}
                                onChange={(e) => handleInputChange('aircraft.registrationNumber')(e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Aircraft Size"
                                value={bookingData.aircraft.size}
                                onChange={(e) => handleInputChange('aircraft.size')(e.target.value)}
                                required
                            >
                                {aircraftSizes.map((size) => (
                                    <MenuItem key={size} value={size}>
                                        {size.charAt(0).toUpperCase() + size.slice(1)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Special Requirements"
                                value={bookingData.specialRequests}
                                onChange={(e) => handleInputChange('specialRequests')(e.target.value)}
                            />
                        </Grid>

                        {bookingData.startDate && bookingData.endDate && (
                            <Grid item xs={12}>
                                <Box sx={{ 
                                    p: 2, 
                                    bgcolor: 'background.default',
                                    borderRadius: 1
                                }}>
                                    <Typography variant="h6" gutterBottom>
                                        Booking Summary
                                    </Typography>
                                    <Typography>
                                        Duration: {
                                            Math.ceil(
                                                (new Date(bookingData.endDate) - new Date(bookingData.startDate)) / 
                                                (1000 * 60 * 60 * 24)
                                            )
                                        } days
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        Estimated Price: ${calculateEstimatedPrice()}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setBookingDialogOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={loading || !bookingData.startDate || !bookingData.endDate || 
                                !bookingData.aircraft.type || !bookingData.aircraft.registrationNumber}
                    >
                        {loading ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ServiceCard;