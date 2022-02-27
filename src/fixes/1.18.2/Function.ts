import { Fix } from '../../Fix'

const locateRegex = /locate (minecraft:)?(mineshaft|ocean_ruin|ruined_portal|shipwreck|village)/

/**
 * Upgrades /locate
 */
export const Function = Fix.onFile('functions', ({ data }: { data: string[] }) => {
	data.forEach((line, i) => {
		if (line.startsWith('locate ') || line.startsWith('execute ')) {
			data[i] = data[i].replace(locateRegex, 'locate #$1$2')
		}
	})
})
