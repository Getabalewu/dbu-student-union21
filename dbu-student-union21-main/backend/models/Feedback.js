const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Query cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
