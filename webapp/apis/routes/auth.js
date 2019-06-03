const express = require('express');
const router  = express.Router();

const auth = require('../accounts/auth');

// @route  GET /
// @desc   renders index
// @access Public
router.get('/', auth.renderIndex);

// @route  GET /register
// @desc   renders register
// @access Public
router.get('/register', auth.renderRegister);

// @route  GET /dashboard
// @desc   renders dashboard
// @access Private
router.get('/dashboard', auth.renderDashboard);

// @route  GET /logout
// @desc   logs out user
// @access Private
router.get('/logout', auth.logout);

// @route  POST /login
// @desc   logs in user
// @access Public
router.post('/login', auth.login);

// @route  POST /register
// @desc   logs in user
// @access Public
router.post('/register', auth.register);

module.exports = router;