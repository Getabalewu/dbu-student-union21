const express = require('express');
const router = express.Router();
const { processChatQuery } = require('../controllers/aiController');

router.post('/chat', processChatQuery);

module.exports = router;
