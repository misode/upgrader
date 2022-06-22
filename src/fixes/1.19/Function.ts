import { Fix } from '../../Fix'

const EffectPattern = /\b((?:CustomPotionEffects|ActiveEffects|Effects):.+\bId\s*:\s*\d+)b\b/
const BeaconEffectPattern = /\b((?:Primary|Secondary)\s*:\s*\d+)b\b/

export const Function = Fix.onFile('functions', ({ data }: { data: string[] }) => {
	data.forEach((line, i) => {
		if (line.startsWith('locate ') || line.startsWith('execute ')) {
			data[i] = data[i].replace('locate ', 'locate structure ')
		}
		if (line.startsWith('locatebiome ') || line.startsWith('execute ')) {
			data[i] = data[i].replace('locatebiome ', 'locate biome ')
		}
		if (line.startsWith('placefeature ') || line.startsWith('execute ')) {
			data[i] = data[i].replace('placefeature ', 'place feature ')
		}
		if (line.includes('Id')) {
			data[i] = data[i].replace(EffectPattern, '$1')
		}
		if (line.includes('Primary') || line.includes('Secondary')) {
			data[i] = data[i].replace(BeaconEffectPattern, '$1')
		}
	})
})
