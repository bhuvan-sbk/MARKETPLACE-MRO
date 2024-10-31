// routes/bookingRoutes.js
 const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Hangar = require('../models/Hangar');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
    try {
        console.log('Received booking request:', {
            body: req.body,
            headers: req.headers,
            user: req.user
        });
        // Get and validate hangar
        const hangar = await Hangar.findById(req.body.hangarId);
        
        console.log('Found hangar:', hangar); // Debug log

        if (!hangar) {
            return res.status(404).json({ error: 'Hangar not found' });
        }

        // Validate hangar pricing specifically
        if (!hangar.pricePerDay || hangar.pricePerDay <= 0) {
            return res.status(400).json({ 
                error: 'Invalid hangar pricing configuration',
                details: 'Hangar price must be a positive number',
                hangarData: {
                    id: hangar._id,
                    currentPrice: hangar.pricePerDay
                }
            });
        }

        // Validate dates
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);

        if (endDate <= startDate) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        // Calculate duration in days
        const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        // Calculate total price
        const totalPrice = hangar.pricePerDay * durationDays;

        // Create booking
        const booking = new Booking({
            hangarId: req.body.hangarId,
            customerId: req.user._id,
            startDate,
            endDate,
            totalPrice,
            aircraft: {
                type: req.body.aircraft.type,
                registrationNumber: req.body.aircraft.registrationNumber,
                size: req.body.aircraft.size
            },
            status: 'pending',
            paymentStatus: 'pending',
            specialRequests: req.body.specialRequests,
            pricing: {
                pricePerDay: hangar.pricePerDay,
                durationDays,
                totalAmount: totalPrice
            }
        });

        await booking.save();

        // Populate booking data
        await booking.populate([
            { path: 'hangarId', select: 'name location pricePerDay' },
            { path: 'customerId', select: 'companyName email' }
        ]);

        res.status(201).json({
            success: true,
            booking,
            summary: {
                durationDays,
                pricePerDay: hangar.pricePerDay,
                totalPrice,
                dates: {
                    start: startDate,
                    end: endDate
                }
            }
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error creating booking', 
            error: error.message 
        });
    }
});


// Add this route to update hangar pricing
router.patch('/:id/price', auth, async (req, res) => {
    try {
        const hangar = await Hangar.findById(req.params.id);
        if (!hangar) {
            return res.status(404).json({ error: 'Hangar not found' });
        }

        // Update pricing
        hangar.price = {
            amount: req.body.amount,
            currency: req.body.currency || 'USD'
        };

        await hangar.save();
        res.json(hangar);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

     
 
// Get all bookings for current user
router.get('/customer', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.user._id })
            .populate('hangarId', 'name location')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific booking
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            customerId: req.user._id
        }).populate('hangarId', 'name location');

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            customerId: req.user._id,
            status: { $nin: ['cancelled', 'completed'] }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;