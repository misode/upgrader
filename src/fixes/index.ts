import { Fix } from '../Fix'
import { Fixes17 } from './1.17'
import { Fixes18 } from './1.18'

export const Fixes = Fix.all(
	Fix.version('1.16.5', '1.17.1', Fixes17),
	Fix.version('21w44a', '1.18-pre1', Fixes18)
)
