import { router } from '../../configs/app'
import authRouter from './auth'
import usersRouter from './users'
import accountRouter from './account'
import verifyToken from '../../middlewares/jwtValidation'

router.use('/auth', authRouter)
router.use('/users', verifyToken, usersRouter)
router.use('/accounts', verifyToken, accountRouter)

export default router
