// models/Booking.js
const mongoose = require('mongoose');



// Check if the model exists before creating
const Booking = mongoose.models.Booking || mongoose.model('Booking', new mongoose.Schema({
    hangarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hangar',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    aircraft: {
        type: {
            type: String,
            required: true
        },
        registrationNumber: {
            type: String,
            required: true
        },
        size: {
            type: String,
            required: true,
            enum: ['small', 'medium', 'large']
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    specialRequests: String,
    pricing: {
        pricePerDay: Number,
        totalAmount: Number,
        durationDays: Number
    }
}, {
    timestamps: true
}));

module.exports = Booking;