import { router } from '../../configs/app'
import AuthController from '../../controllers/AuthController'
import { validatePayloadSchema } from '../../middlewares/payloadValidation'
import { register, login, logout, refreshToken } from '../../schemas/authSchema'
import verifyToken from '../../middlewares/jwtValidation'

const authController = new AuthController()

router.post(
	'/register',
	validatePayloadSchema(register),
	authController.register.bind(authController)
)
router.post(
	'/login',
	validatePayloadSchema(login),
	authController.login.bind(authController)
)
router.post(
	'/logout',
	verifyToken,
	validatePayloadSchema(logout),
	authController.logout.bind(authController)
)
router.post(
	'/token/refresh',
	validatePayloadSchema(refreshToken),
	authController.refreshToken.bind(authController)
)

export default router
