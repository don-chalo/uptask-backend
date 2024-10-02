import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post('/account',
    body('name').notEmpty().withMessage('El nombre no puede ser vacío'),
    body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres'),
    body('email').notEmpty().withMessage('Email no válido'),
    body('password-confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    }),
    handleInputErrors,
    AuthController.createAccount
);

router.post('/confirm-account',
    body('token').notEmpty().withMessage('El token no puede ir vacío'),
    handleInputErrors,
    AuthController.confirmAccount
);

router.post('/login',
    body('email').notEmpty().withMessage('Email no válido'),
    body('password').notEmpty().withMessage('Contraseña no puede ser vacía'),
    handleInputErrors,
    AuthController.login
);

router.post('/request-code',
    body('email').notEmpty().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.requestConfirmationCode
);

router.post('/forgot-password',
    body('email').notEmpty().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.forgotPassword
);

router.post('/validate-token',
    body('token').notEmpty().withMessage('El token no puede ir vacío'),
    handleInputErrors,
    AuthController.validateAccount
);

router.post('/update-password',
    body('token').isNumeric().withMessage('Token no válido'),
    body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres'),
    body('password-confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    }),
    handleInputErrors,
    AuthController.updatePassword
);

router.get('/user',
    authenticate,
    AuthController.user
)

/* Profile */
router.put('/profile',
    body('name').notEmpty().withMessage('El nombre no puede ser vacío'),
    body('email').notEmpty().withMessage('Email no válido'),
    authenticate,
    handleInputErrors,
    AuthController.updateProfile
);

router.post('/change-password',
    authenticate,
    body('current-password').notEmpty().withMessage('El password actual no puede ser vacío'),
    body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres'),
    body('password-confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    }),
    handleInputErrors,
    AuthController.updateCurrentPassword
);


router.post('/check-password',
    authenticate,
    body('password').notEmpty().withMessage('El password no puede ser vacío'),
    handleInputErrors,
    AuthController.checkPassword
)

export default router;
