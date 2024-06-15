import { router } from '../configs/app'
import version1 from './v1'

router.use('/v1', version1)

export default router
