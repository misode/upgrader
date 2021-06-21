import { Fix } from '../Fix'

const replaceitemRegex = /replaceitem ((?:entity @[parse](\[.*\]*)?|block( [^ ]+){3}) [a-z0-9.]+) /
const timeObjectiveRegex = /scoreboard objectives add ([^ ]+) (minecraft.)?custom:(minecraft.)?play_one_minute/

/**
 * Upgrades /replaceitem to /item replace ... with
 */
export const Function = Fix.onFile('functions', (data: string[]) => {
	data.forEach((line, i) => {
		if (line.startsWith('replaceitem ') || line.startsWith('execute ')) {
			data[i] = line.replace(replaceitemRegex, 'item replace $1 with ')
		}
		if (line.startsWith('scoreboard') || line.startsWith('execute')) {
			data[i] = line.replace(timeObjectiveRegex, 'scoreboard objectives add $1 $2custom:$3total_world_time')
		}
	})
})
