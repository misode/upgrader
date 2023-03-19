import { Fix } from '../../Fix'

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
	if (typeof data?.conditions !== 'object') return

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
	if (typeof data !== 'object') return

	data.entries?.forEach(fixEntry)
	data.conditions?.forEach(fixCondition)
}

function fixEntry(data: any) {
	if (typeof data !== 'object') return

	data.children?.forEach(fixEntry)
	data.conditions?.forEach(fixCondition)
}

function fixCondition(data: any) {
	if (typeof data !== 'object') return

	const condition = data.condition?.replace(/^minecraft:/, '')
	switch (condition) {
		case 'alternative':
			data.terms?.forEach(fixCondition)
			break
		case 'inverted':
			fixCondition(data.term)
			break
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

	const tags: any[] = []
	if (data.is_projectile !== undefined) {
		tags.push({ id: 'minecraft:is_projectile', expected: true })
		delete data.is_projectile
	}
	if (data.is_explosion !== undefined) {
		tags.push({ id: 'minecraft:is_explosion', expected: true })
		delete data.is_explosion
	}
	if (data.bypasses_armor !== undefined) {
		tags.push({ id: 'minecraft:bypasses_armor', expected: true })
		delete data.bypasses_armor
	}
	if (data.bypasses_invulnerability !== undefined) {
		tags.push({ id: 'minecraft:bypasses_invulnerability', expected: true })
		delete data.bypasses_invulnerability
	}
	if (data.bypasses_magic !== undefined) {
		// TODO
		delete data.bypasses_magic
	}
	if (data.is_fire !== undefined) {
		tags.push({ id: 'minecraft:is_fire', expected: true })
		delete data.is_fire
	}
	if (data.is_magic !== undefined) {
		// TODO
		delete data.is_magic
	}
	if (data.is_lightning !== undefined) {
		tags.push({ id: 'minecraft:is_lightning', expected: true })
		delete data.is_projectile
	}

	if (tags.length > 0) {
		data.tags = tags
	}
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
}
