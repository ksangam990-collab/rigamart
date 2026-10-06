const express = require('express');
const router = express.Router();
const { askProductAssistant, getSuggestedQuestions, askStylistChat } = require('../controllers/aiController');

// Public route to ask Gemini AI about a specific product
router.post('/ask-product', askProductAssistant);

// Public route for homepage Rigamart AI Stylist chat card
router.post('/chat', askStylistChat);

// Public route to fetch tailored starter questions for a product
router.get('/suggested-questions', getSuggestedQuestions);

module.exports = router;
