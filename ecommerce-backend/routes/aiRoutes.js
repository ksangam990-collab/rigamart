const express = require('express');
const router = express.Router();
const { askProductAssistant, getSuggestedQuestions } = require('../controllers/aiController');

// Public route to ask Gemini AI about a product
router.post('/ask-product', askProductAssistant);

// Public route to fetch tailored starter questions for a product
router.get('/suggested-questions', getSuggestedQuestions);

module.exports = router;
