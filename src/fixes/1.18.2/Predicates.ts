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
}

function fixLocation(data: any) {
	if (typeof data !== 'object') return

	if (typeof data.feature === 'string') {
		switch (data.feature) {
			case 'endcity':
				data.feature = 'minecraft:end_city'
				break
			default:
				data.feature = 'minecraft:' + data.feature
		}
	}
}
