import { Fix } from '../Fix'
import { Fixes17 } from './1.17'
import { Fixes18 } from './1.18'
import { Fixes182 } from './1.18.2'
import { Fixes19 } from './1.19'
import { Fixes193 } from './1.19.3'
import { Fixes194 } from './1.19.4'
import { Fixes20 } from './1.20'
import { Fixes21w44a } from './21w44a'
import { ParseErrors } from './ParseErrors'

export const Fixes = Fix.all(
	ParseErrors,
	Fixes17,
	Fixes21w44a,
	Fixes18,
	Fixes182,
	Fixes19,
	Fixes193,
	Fixes194,
	Fixes20,
)
