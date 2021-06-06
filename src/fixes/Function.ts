import { Fix } from '../Fix'

const replaceitemRegex = /replaceitem (entity @.[^[]* .+ |entity @.\[.*\] .+ |block (.+ ){4})/

/**
 * Upgrades /replaceitem to /item replace ... with
 */
export const Function = Fix.onFile('functions', (data: string[]) => {
	data.forEach((line, i) => {
		if (line.startsWith('replaceitem ') || line.startsWith('execute ')) {
			data[i] = line.replace(replaceitemRegex, 'item replace $1with ')
		}
	})
})
