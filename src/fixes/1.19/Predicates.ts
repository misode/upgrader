import { Fix } from '../../Fix'

/**
 * Fixes feature in location predicate
 */
export const Predicates = Fix.all(
	Fix.onFile('predicates', ({ data }) => {
		if (Array.isArray(data)) {
			data.forEach(fixCondition)
		} else {
			fixCondition(data)
		}
	}),
	Fix.onFile('advancements', ({ data }) => {
		Object.values(data.criteria).forEach(fixCriterion)
	}),
	Fix.onFile('loot_tables', ({ data }) => {
		data.pools?.forEach(fixPool)
	}),
)

function fixCriterion(data: any) {
	if (typeof data.conditions !== 'object') return

	fixEntity(data.conditions.entity)
	fixEntity(data.conditions.player)
	fixEntity(data.conditions.parent)
	fixEntity(data.conditions.partner)
	fixEntity(data.conditions.child)
	fixEntity(data.conditions.villager)
	fixEntity(data.conditions.zombie)
	fixEntity(data.conditions.projectile)
	fixEntity(data.conditions.shooter)
	data.conditions.victims?.forEach(fixEntity)

	fixDamage(data.conditions.damage)
	fixDamage(data.conditions.killing_blow)
	
	fixLocation(data.conditions.location)
	fixLocation(data.conditions.entered)
	fixLocation(data.conditions.exited)

	const trigger = data.trigger.replace(/^minecraft:/, '')
	switch (trigger) {
		case 'location':
		case 'slept_in_bed':
		case 'hero_of_the_village':
		case 'voluntary_exile':
			if (typeof data.conditions !== 'object') break
			const { player, location } = data.conditions
			data.conditions = {
				player: mergePlayerLocation(player, location),
			}
			break
	}
}

function fixPool(data: any) {
	data.entries?.forEach(fixEntry)
	data.conditions?.forEach(fixCondition)
}

function fixEntry(data: any) {
	data.children?.forEach(fixEntry)
	data.conditions?.forEach(fixCondition)
}

function fixCondition(data: any) {
	const condition = data.condition.replace(/^minecraft:/, '')
	switch (condition) {
		case 'entity_properties':
			fixEntity(data.predicate)
			break
		case 'damage_source_properties':
			fixDamage(data.predicate)
			break
		case 'location_check':
			fixLocation(data.predicate)
			break
	}
}

function fixDamage(data: any) {
	if (typeof data !== 'object') return

	fixEntity(data.source_entity)
	fixEntity(data.direct_entity)
	fixDamage(data.type)
}

function fixEntity(data: any) {
	if (typeof data !== 'object') return

	if (Array.isArray(data)) {
		data.forEach(fixCondition)
		return
	}

	fixEntity(data.vehicle)
	fixEntity(data.targeted_entity)
	fixLocation(data.location)

	if (data.player) {
		data.type_specific = {
			type: 'player',
			player: data.player,
		}
		delete data.player
	} else if (data.fishing_hook) {
		data.type_specific = {
			type: 'fishing_hook',
			...data.fishing_hook,
		}
		delete data.fishing_hook
	} else if (data.lightning_bolt) {
		data.type_specific = {
			type: 'lightning',
			...data.lightning_bolt,
		}
		delete data.lightning_bolt
	} else if (data.catType) {
		let variant = data.catType.replace(/^textures\/entity\/cat\/([a-z_]+).png/, '$1')
		if (variant === 'british_shorthair') {
			variant = 'british'
		}
		data.type_specific = {
			type: 'cat',
			variant,
		}
		delete data.catType
	}
}

function fixLocation(data: any) {
	if (typeof data !== 'object') return

	if (typeof data.feature === 'string') {
		data.structure = data.feature
		delete data.feature
	}
}

function mergePlayerLocation(player: any, location: any) {
	if (player === undefined) return { location }
	if (Array.isArray(player) && player.length >= 1) {
		return [player, { type: 'minecraft:entity_properties', predicate: { location } }]
	}
	return {
		...player,
		location: {
			...player.location,
			...location,
		},
	}
}
