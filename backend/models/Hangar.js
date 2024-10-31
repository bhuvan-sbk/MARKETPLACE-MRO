// models/Hangar.js
const mongoose = require('mongoose');

const hangarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    size: {
        type: String,
        required: [true, 'Size is required'],
        enum: {
            values: ['small', 'medium', 'large', 'extra-large'],
            message: 'Size must be small, medium, large, or extra-large'
        }
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: {
            values: ['available', 'occupied', 'maintenance', 'inactive'],
            message: 'Status must be available, occupied, maintenance, or inactive'
        },
        default: 'available'
    },
    pricePerDay: {
        type: Number,
        required: [true, 'Price per day is required'],
        min: [0, 'Price cannot be negative']
    },
    amenities: [{
        type: String,
        enum: {
            values: ['security', 'lighting', 'maintenance', 'power', 'water', 'internet', 'climate-control'],
            message: '{VALUE} is not a valid amenity'
        }
    }],
    location: {
        address: {
            type: String,
            required: [true, 'Address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            minLength: [2, 'State code must be 2 characters'],
            maxLength: [2, 'State code must be 2 characters']
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required'],
            match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid zip code']
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner is required']
    },
    availability: [{
        startDate: {
            type: Date,
            required: [true, 'Start date is required']
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required']
        }
    }],
    images: [{
        url: String,
        caption: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
hangarSchema.index({ 'location.city': 1 });
hangarSchema.index({ status: 1 });
hangarSchema.index({ pricePerDay: 1 });
hangarSchema.index({ owner: 1 });

// Virtual for bookings
hangarSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'hangarId',
    options: { sort: { createdAt: -1 } }
});

// Pre-save middleware to validate dates
hangarSchema.pre('save', function(next) {
    if (this.availability && this.availability.length > 0) {
        const hasInvalidDates = this.availability.some(slot => 
            slot.startDate >= slot.endDate
        );
        
        if (hasInvalidDates) {
            next(new Error('End date must be after start date for all availability slots'));
        }
    }
    next();
});

const Hangar = mongoose.model('Hangar', hangarSchema);

module.exports = Hangar;