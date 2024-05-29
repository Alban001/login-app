const { getAll, create, getOne, remove, update, verififyCode, login, getLoggedUser } = require('../controllers/user.controller');
const express = require('express');
const verifyJWT = require('../utils/verifyJWT');

const routerUser = express.Router();

routerUser.route('/users')
    .get(verifyJWT, getAll)
    .post(create);

routerUser.route('/users/login')
    .post(login) 

routerUser.route('/users/me')
    .get(verifyJWT, getLoggedUser)

routerUser.route('/users/:id')
    .get(verifyJWT, getOne)
    .delete(verifyJWT, remove)
    .put(verifyJWT, update);
routerUser.route('/users/verify/:code')
    .get(verififyCode)

module.exports = routerUser;