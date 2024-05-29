const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const EmailCode = require('../models/EmailCode');
const jwt = require('jsonwebtoken')

const getAll = catchError(async(req, res) => {
    const results = await User.findAll({});
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const {email, password,firstName, lastName,country, image, frontBaseUrl} = req.body;
    const encriptedPassword = await bcrypt.hash(password, 10);
    const result = await User.create({
        email,
        password: encriptedPassword,
        firstName,
        lastName:lastName,
        country,
        image
    });

    const code = require('crypto').randomBytes(32).toString('hex');

    const link = `${frontBaseUrl}/${code}`


    await EmailCode.create({
        code: code,
        userId: result.id,
    })

    await sendEmail({
        to:email,
        subject:"Verificate mail for users",
        html:`
        <h1>hola ${firstName} ${lastName}</h1><br>
        <p>racias por crear una cuenta con nosotros</p>
        <p>Para verificar tu email, haz click en el siguiente enlace : </p>
        <a href="${link}">${link}</a>
        `
    })
    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await User.destroy({ where: {id} });
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const {email, firstName, lastName,country, image,isVerified } = req.body;
    const {id} = req.params;
    const results = await User.update({
        email,
        firstName,
        lastName,
        country,
        image,
        }, {where : {id : id}})
    return res.json(results);
});

const verififyCode = catchError(async(req,res)=>{
        const {code} = req.params;
        const emailCode = await EmailCode.findOne({where: {code:code}})
        if(!emailCode) return res.status(401).json({message: 'Invalid code'})

        const user = await User.findByPk(emailCode.userId)
        user.isVerified= true
        await user.save()
        await emailCode.destroy()
        return res.json(user)
})
const login = catchError(async (req, res)=>{
    const {email, password}=req.body;
    const user = await User.findOne({where : {email}})
    if(!user) return res.status(401).json({message: 'Invalid credentials'})
    if(!user.isVerified) return res.status(401).json({message: 'User is not verified'})
    const isValid = await bcrypt.compare(password,user.password)
    if(!isValid) return res.status(401).json({message: 'Invalid credentials'})
    
    const token = jwt.sign(
        {user},
        process.env.TOKEN_SECRET,
        {expiresIn: '1d'},

    )
    return res.json({user, token})
})

const getLoggedUser = catchError(async(req, res)=>{
    return res.json(req.user)
})


module.exports = {
    getAll,
    create, 
    getOne,
    remove,
    update,
    verififyCode,
    login,
    getLoggedUser
}