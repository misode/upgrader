import { Fix } from '../../Fix'
import { Feature } from './Feature'
import { NoiseSettings } from './NoiseSettings'

export const Fixes18 = Fix.all(
	Fix.debug('1.18 fixes'),
	Fix.when('worldgen',
		Feature,
		NoiseSettings
	),
)
