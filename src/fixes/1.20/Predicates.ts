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

	const trigger = data.trigger.replace(/^minecraft:/, '')
	switch (trigger) {
		case 'allay_drop_item_on_block':
		case 'item_used_on_block':
		case 'placed_block':
			const predicates = []
			if (data.conditions.block || data.conditions.state) {
				predicates.push({
					condition: 'minecraft:block_state_property',
					block: data.conditions.block,
					properties: data.conditions.state,
				})
			}
			if (data.conditions.item) {
				predicates.push({
					condition: 'minecraft:match_tool',
					predicate: data.conditions.item,
				})
			}
			if (data.conditions.location) {
				predicates.push({
					condition: 'minecraft:location_check',
					predicate: data.conditions.location,
				})
			}
			data.conditions.location = predicates
			delete data.conditions.block
			delete data.conditions.states
			delete data.conditions.item
			break
	}
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
			data.condition = 'minecraft:any_of'
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
