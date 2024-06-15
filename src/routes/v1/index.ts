import { router } from '../../configs/app'
import authRouter from './auth'
import usersRouter from './users'
import verifyToken from '../../middlewares/jwtValidation'

router.use('/auth', authRouter)
router.use('/users', verifyToken, usersRouter)
router.use('/account', verifyToken, usersRouter)

export default router
