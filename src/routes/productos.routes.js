import { Router } from 'express';
import { check } from 'express-validator';
import {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    actualizarProducto,
    borrarProducto
} from '../controllers/producto.controller.js';
import { validarCampos } from '../middlewares/validarCampos.middleware.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarRolAdmin } from '../middlewares/rol.middleware.js';

const router = Router();

const checksProducto = [
    check('nombre', 'El nombre debe ser un texto').optional().isString(),
    check('precio', 'El precio debe ser un numero').optional().isNumeric(),
    check('precio', 'El precio no puede ser negativo').optional().isFloat({ min: 0 }),
    check('stock', 'El stock debe ser un numero').optional().isNumeric(),
    check('stock', 'El stock no puede ser negativo').optional().isFloat({ min: 0 }),
    check('codigoSKU', 'El formato del SKU debe ser AAA-111').optional().matches(/^[A-Z]{3}-\d{3}$/),
    check('categoria', 'Categoria no valida').optional().isIn(['PERIFERICOS', 'MONITORES', 'COMPONENTES', 'ACCESORIOS']),
    check('proveedor', 'El proveedor debe ser un ID válido').optional().isMongoId(),
    check('estadoActivo', 'El estadoActivo debe ser booleano').optional().isBoolean(),
];

const checksProductoObligatorios = [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('precio', 'El precio es obligatorio').not().isEmpty(),
    check('codigoSKU', 'El código SKU es obligatorio').not().isEmpty(),
    check('proveedor', 'El proveedor es obligatorio').not().isEmpty(),
];

// Check de :id para las rutas que lo usan como parámetro (PUT y DELETE).
// check() sin location explícita revisa body, params y query, así que sirve para params también.
const checkIdValido = [
    check('id', 'El ID del producto no es válido').isMongoId(),
];

// Crear producto: hay que estar logueado (verificarToken) Y ser ADMIN (verificarRolAdmin).
// El orden importa: primero confirmamos identidad, recién después chequeamos el rol
// (verificarRolAdmin necesita que req.usuario ya exista, y lo pone verificarToken).
router.post('/', [
    verificarToken,
    verificarRolAdmin,
    ...checksProductoObligatorios,
    ...checksProducto,
    validarCampos,
], crearProducto);

// Listar y ver por id quedan públicos a propósito: es el catálogo, cualquiera lo puede consultar.
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);

// Actualizar: mismo criterio que crear, más la validación del :id.
router.put('/:id', [
    verificarToken,
    verificarRolAdmin,
    ...checkIdValido,
    ...checksProducto,
    validarCampos,
], actualizarProducto);

// Borrar (en realidad es soft-delete, pone estadoActivo en false): mismo criterio.
router.delete('/:id', [
    verificarToken,
    verificarRolAdmin,
    ...checkIdValido,
    validarCampos,
], borrarProducto);

export default router;