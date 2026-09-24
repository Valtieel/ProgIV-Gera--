import { Router } from 'express';
import { check } from 'express-validator';
import {
    login,
    registrarUsuario
} from '../controllers/auth.controller.js';
import { limitadorLogin } from '../middlewares/rateLimit.middleware.js';
import { validarCampos } from '../middlewares/validarCampos.middleware.js';

const router = Router();

// Checks para el registro: acá sí exigimos formato fuerte,
// porque es la única vez que el usuario define su password.
const checksRegistro = [
    check('email', 'El email es obligatorio').notEmpty(),
    check('email', 'El email no tiene un formato valido').isEmail(),
    check('password', 'El password es obligatorio').notEmpty(),
    check('password', 'El password debe tener al menos 6 caracteres').isLength({ min: 6 }),
    // rol es opcional: si no lo mandan, el schema de Mongoose ya pone 'VENDEDOR' por default.
    // Si lo mandan, que sea uno de los dos valores válidos (evita que alguien mande "ADMIN " con espacio, "root", etc.)
    check('rol', 'Rol no valido').optional().isIn(['ADMIN', 'VENDEDOR']),
];

// Checks para el login: acá NO validamos longitud ni formato estricto de password,
// porque el password ya está hasheado en la base — solo nos interesa que no venga vacío.
// (Si alguien manda un password de 3 caracteres, el login va a fallar igual en el controller
// porque no va a coincidir con el hash, así que validar longitud acá no suma nada.)
const checksLogin = [
    check('email', 'El email es obligatorio').notEmpty(),
    check('email', 'El email no tiene un formato valido').isEmail(),
    check('password', 'El password es obligatorio').notEmpty(),
];

router.post('/', checksRegistro, validarCampos, registrarUsuario);

// Nota: dejamos limitadorLogin DESPUÉS de la validación.
// Así, si alguien manda datos mal formados, ni siquiera consume un intento
// de los 5 que permite el rate limiter cada hora.
router.post('/login', checksLogin, validarCampos, limitadorLogin, login);

export default router;