import { Fix } from '../../Fix'
import { Predicates } from './Predicates'

export const Fixes20 = Fix.version('1.19.4', '1.20', Fix.groupProblems(
	Fix.packFormat(15),
	Fix.when('predicates',
		Predicates,
	),
))

// TODO: rotate item_display transform 180 degrees
// TODO: fix sign NBT
