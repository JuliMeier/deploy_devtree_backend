import { Router } from 'express'
import { body } from 'express-validator'
import { createAccount, getUser, getUserByHandle, login, searchByHandle, updateProfile, uploadImage } from './handlers'
import { handleInputErrors } from './middlewares/validation'
import { authenticate } from './middlewares/auth'


const router = Router()

/* Autenticacion y Registro */
router.post('/auth/register', 
    body('handle')
        .notEmpty()
        .withMessage('El handle no puede ir vacio'),
    body('name')
        .notEmpty()
        .withMessage('El Nombre no puede ir vacio'),
    body('email')
        .isEmail()
        .withMessage('El email no es valido'),
    body('password')
        .isLength({min: 8})
        .withMessage('El password debe ser de al menos 8 caracteres'),
    handleInputErrors,
    createAccount
   
    
)

router.post('/auth/login',
    body('email')
        .isEmail()
        .withMessage('El email no es valido'),
    body('password')
        .notEmpty()
        .withMessage('El password es obligatorio'),
    handleInputErrors,
    login
)

router.get('/user', authenticate ,getUser)

router.patch('/user',
    body('handle')
        .notEmpty()
        .withMessage('El handle no puede ir vacio'),
    handleInputErrors,
    authenticate, 
    updateProfile)

router.post('/user/image', authenticate, uploadImage)

router.get('/:handle', getUserByHandle)

router.post('/search', 
    body('handle')
    .notEmpty()
    .withMessage('El handle no puede ir vacio'),
    handleInputErrors,
    searchByHandle)

export default router