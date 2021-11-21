import { Fix } from '../../Fix'
import { Advancement } from './Advancement'
import { Biome } from './Biome'
import { Dimension } from './Dimension'
import { Feature } from './Feature'

export const Fixes21w44a = Fix.all(
	Fix.debug('21w44a fixes'),
	Fix.assert(pack => pack.meta.data.pack.pack_format < 8, 'This pack already has pack_format 8 or higher and cannot be upgraded.'),
	Fix.when('predicates', Advancement),
	Fix.when('worldgen',
		Dimension,
		Feature,
		Biome,
	),
	Fix.when('packFormat', pack => pack.meta.data.pack.pack_format = 8),
)
