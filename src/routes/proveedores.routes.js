import { Router } from 'express';
import { check } from 'express-validator';
import {
    crearProveedor,
    obtenerProveedores,
    actualizarCalificacion
} from '../controllers/proveedor.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarRolAdmin } from '../middlewares/rol.middleware.js';
import { validarCampos } from '../middlewares/validarCampos.middleware.js';

const router = Router();

// Checks para crear proveedor, calcados de los campos required del schema de Mongoose
// (así el error aparece antes, con un 400 prolijo, en vez de que Mongoose tire su propio error).
const checksProveedor = [
    check('razonSocial', 'La razon social es obligatoria').not().isEmpty(),
    check('cuit', 'El CUIT debe tener exactamente 11 numeros sin guiones').matches(/^\d{11}$/),
    check('contacto.email', 'El email de contacto es obligatorio y debe ser valido').isEmail(),
    check('calificacion', 'La calificacion debe ser un numero entre 1 y 5').optional().isFloat({ min: 1, max: 5 }),
];

// Check específico para el PATCH de calificación: acá sí es obligatoria
// (es lo único que este endpoint actualiza, no tendría sentido llamarlo sin mandar el valor).
const checkCalificacion = [
    check('id', 'El ID del proveedor no es valido').isMongoId(),
    check('calificacion', 'La calificacion es obligatoria').not().isEmpty(),
    check('calificacion', 'La calificacion debe ser un numero entre 1 y 5').isFloat({ min: 1, max: 5 }),
];

router.post('/', [
    verificarToken,
    verificarRolAdmin,
    ...checksProveedor,
    validarCampos,
], crearProveedor);

router.get('/', verificarToken, obtenerProveedores);

// Antes esta ruta no tenía NINGÚN control: ni login, ni rol, ni validación del número.
// La igualamos al mismo criterio que crear/editar (solo ADMIN puede recalificar).
router.patch('/:id/calificacion', [
    verificarToken,
    verificarRolAdmin,
    ...checkCalificacion,
    validarCampos,
], actualizarCalificacion);

export default router;