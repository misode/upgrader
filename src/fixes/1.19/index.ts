import { Fix } from '../../Fix'
import { Predicates } from './Predicates'

export const Fixes19 = Fix.version('1.18.2', '1.19', Fix.groupProblems(
	Fix.debug('1.19 fixes'),
	Fix.when('predicates',
		Predicates,
	),
	Fix.packFormat(10),
))
