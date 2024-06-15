import { router } from '../../configs/app'
import UserController from '../../controllers/UserController'
import {
	validatePayloadSchema,
	validateParamSchema
} from '../../middlewares/payloadValidation'
import {
	lists,
	update,
	remove,
	readByAccountNumber,
	readByRegistrationNumber
} from '../../schemas/userSchema'

const userController = new UserController()

router.post(
	'/lists',
	validatePayloadSchema(lists),
	userController.read.bind(userController)
)
router.post(
	'/:account_number',
	validateParamSchema(readByAccountNumber),
	userController.readByAccountNumber.bind(userController)
)
router.post(
	'/:registration_number',
	validateParamSchema(readByRegistrationNumber),
	userController.readByRegistrationNumber.bind(userController)
)
router.post(
	'/update',
	validatePayloadSchema(update),
	userController.updateUser.bind(userController)
)
router.post(
	'/delete',
	validatePayloadSchema(remove),
	userController.deleteUser.bind(userController)
)

export default router
