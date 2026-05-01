const express = require('express');
const Message = require('../models/Message');
const Club = require('../models/Club');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Submit a question from Student to Club
// @route   POST /api/messages/club/:clubId
// @access  Private (Registered Students)
router.post('/club/:clubId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const club = await Club.findById(req.params.clubId);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    const message = await Message.create({
      sender: req.user._id,
      club: req.params.clubId,
      content
    });

    res.status(201).json({ success: true, message: 'Question submitted successfully', data: message });
  } catch (error) {
    console.error('Submit message error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting question' });
  }
});

// @desc    Get Inbox messages for a specific Club Rep
// @route   GET /api/messages/club/:clubId
// @access  Private/ClubLeader
router.get('/club/:clubId', protect, async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    const isLeader = (club.leadership?.president?.toString() === req.user._id.toString()) ||
      (club.leadership?.vicePresident?.toString() === req.user._id.toString()) ||
      req.user.role === 'president' ||
      req.user.role === 'clubs_coordinator' ||
      req.user.isAdmin;

    if (!isLeader) return res.status(403).json({ success: false, message: 'Not authorized for this inbox' });

    const messages = await Message.find({ club: req.params.clubId })
      .populate('sender', 'name email department year')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving inbox' });
  }
});

// @desc    Reply to a specific message (Club Rep)
// @route   PATCH /api/messages/:msgId/reply
// @access  Private/ClubLeader
router.patch('/:msgId/reply', protect, async (req, res) => {
  try {
    const { response } = req.body;
    if (!response) return res.status(400).json({ success: false, message: 'Response is required' });

    const message = await Message.findById(req.params.msgId).populate('club');
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    const club = message.club;
    const isLeader = club && (
      (club.leadership?.president?.toString() === req.user._id.toString()) ||
      (club.leadership?.vicePresident?.toString() === req.user._id.toString()) ||
      req.user.role === 'president' ||
      req.user.role === 'clubs_coordinator' ||
      req.user.isAdmin
    );

    if (!isLeader) return res.status(403).json({ success: false, message: 'Not authorized to reply to this message' });

    message.response = response;
    message.status = 'Answered';
    await message.save();

    res.json({ success: true, message: 'Reply sent successfully', data: message });
  } catch (error) {
    console.error('Reply message error:', error);
    res.status(500).json({ success: false, message: 'Server error replying to message' });
  }
});

// @desc    Coordinator Log View (ALL Messages)
// @route   GET /api/messages/log
// @access  Private/Coordinator
router.get('/log', protect, async (req, res) => {
  try {
    if (!req.user.isAdmin && req.user.role !== 'clubs_coordinator') {
      return res.status(403).json({ success: false, message: 'Not authorized to view communication logs' });
    }

    const messages = await Message.find()
      .populate('club', 'name category')
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    console.error('Get log error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving logs' });
  }
});

module.exports = router;
