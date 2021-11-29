import { Fix } from '../../Fix'

export const Advancement = Fix.all(
	Fix.onFile('advancements', ({ data }) => {
		Object.values(data.criteria).forEach(fixCriterion)
	}),
)

function fixCriterion(data: any) {
	const trigger = data.trigger.replace(/^minecraft:/, '')
	switch (trigger) {
		case 'nether_travel':
			if (typeof data.conditions !== 'object') break
			const { distance, entered, exited, player } = data.conditions
			data.conditions = {
				player: mergePlayerLocation(player, exited),
				start_position: entered,
				distance: distance,
			}
			break
	}
}

function mergePlayerLocation(player: any, location: any) {
	if (player === undefined) return location
	if (Array.isArray(player) && player.length >= 1) {
		return player // TODO
	}
	return {
		...player,
		location: {
			...player.location,
			...location,
		},
	}
}
