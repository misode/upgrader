import { Fix } from '../../Fix'

export const Fixes18 = Fix.all(
	Fix.debug('1.18 fixes'),
	Fix.assert((pack) => pack.meta.data.pack.pack_format !== 8, 'This pack already has pack_format 8 and cannot be upgraded.'),
)
