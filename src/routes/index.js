const express = require('express');
const routerUser = require('../routers/user.router');
const EmailCode = require('../models/EmailCode');
const User = require('../models/User');
const router = express.Router();

// colocar las rutas aquí
EmailCode.belongsTo(User)
User.hasOne(EmailCode)


router.use(routerUser)
module.exports = router;