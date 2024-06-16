import { router } from '../../configs/app'
import AccountController from '../../controllers/AccountController'
import { validatePayloadSchema } from '../../middlewares/payloadValidation'
import { lists } from '../../schemas/accountSchema'

const accountController = new AccountController()

router.post(
	'/getAll',
	validatePayloadSchema(lists),
	accountController.read.bind(accountController)
)

export default router
