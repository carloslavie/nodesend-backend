const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');
const auth = require('../middleware/auth');


router.post('/',

    [
        check('email', 'Ingrese un email valido').isEmail(),
        check('password', 'El password es obligatorio').not().isEmpty(),
    ],
    authController.autentincarUsuario
);

router.get('/',
    auth,
    authController.usuarioAutenticado
);

module.exports = router;