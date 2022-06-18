import type { FixContext } from '../../Fix'
import { Fix } from '../../Fix'

export const Structure = Fix.all(
	Fix.rename('worldgen/configured_structure_feature', 'worldgen/structure'),
	Fix.rename('tags/worldgen/configured_structure_feature', 'tags/worldgen/structure'),
	Fix.onFile('worldgen/structure_set', ({ data, name }, ctx) => fixStructureSet(data, name, ctx)),
	Fix.onFile('worldgen/structure', ({ data }) => fixStructure(data)),
)

function fixStructure(data: any) {
	if (typeof data !== 'object') return
	
	const type = data.type?.replace(/^minecraft:/, '')
	if (type === 'mineshaft') {
		data.mineshaft_type = data.config.type
	}

	Object.assign(data, data.config)
	delete data.config
	data.step = 'surface_structures'
	delete data.probability

	if (data.adapt_noise) {
		data.terrain_adaptation = type === 'stronghold' ? 'bury' : 'beard_thin'
		delete data.adapt_noise
	}

	switch (type) {
		case 'bastion_remnant':
			data.type = 'minecraft:jigsaw'
			data.start_height = { absolute: 33 }
			data.max_distance_from_center = 80
			data.use_expansion_hack = false
			break
		case 'pillager_outpost':
		case 'village':
			data.type = 'minecraft:jigsaw'
			data.start_height = { absolute: 0 },
			data.project_start_to_heightmap = 'WORLD_SURFACE_WG'
			data.max_distance_from_center = 80
			data.use_expansion_hack = true
			break
		case 'endcity':
			data.type = 'minecraft:end_city'
			break
		case 'jungle_pyramid':
			data.type = 'minecraft:jungle_temple'
			break
		case 'mansion':
			data.type = 'minecraft:woodland_mansion'
			break
		case 'monument':
			data.type = 'minecraft:ocean_monument'
			break
		case 'ruined_portal':
			const Setups: Record<string, unknown[]> = {
				standard: [
					setup({ weight: 0.5, can_be_cold: true, air_pocket_probability: 1, mossiness: 0.2 }),
					setup({ weight: 0.5, can_be_cold: true, air_pocket_probability: 0.5, mossiness: 0.2, placement: 'on_land_surface'  }),
				],
				desert: [setup({ placement: 'partly_buried' })],
				jungle: [setup({ vines: true, overgrown: true, air_pocket_probability: 0.5, mossiness: 0.8, placement: 'on_land_surface' })],
				mountain: [
					setup({ weight: 0.5, can_be_cold: true, air_pocket_probability: 0.1, mossiness: 0.2, placement: 'in_mountain' }),
					setup({ weight: 0.5, can_be_cold: true, air_pocket_probability: 0.5, mossiness: 0.2, placement: 'on_land_surface' }),
				],
				nether: [setup({ replace_with_blackstone: true, air_pocket_probability: 0.5, placement: 'in_nether' })],
				ocean: [setup({ can_be_cold: true, mossiness: 0.8, placement: 'on_ocean_floor' })],
				swamp: [setup({ vines: true, mossiness: 0.5, placement: 'on_ocean_floor' })],
			}
			data.setups = Setups[data.portal_type] ?? []
			delete data.portal_type
	}
}

function setup(setup: { weight?: number, vines?: boolean, can_be_cold?: boolean, replace_with_blackstone?: boolean, overgrown?: boolean, air_pocket_probability?: number, mossiness?: number, placement?: string } = {}) {
	return {
		weight: 1,
		vines: false,
		can_be_cold: false,
		replace_with_blackstone: false,
		placement: 'underground',
		air_pocket_probability: 0,
		mossiness: 0,
		overgrown: false,
		...setup,
	}
}

function fixStructureSet(data: any, name: string, ctx: FixContext) {
	if (typeof data !== 'object') return

	if (!data.structures[0]?.structure) return

	const structure = ctx.read('worldgen/structure', data.structures[0].structure)?.data
	if (!structure) return

	const structureType = structure.type?.replace(/^minecraft:/, '')
	switch (structureType) {
		case 'mineshaft':
			data.placement.frequency_reduction_method = 'legacy_type_3'
			data.placement.frequency = structure.config.probability
			break
	}

	if (name === 'minecraft:pillager_outposts') {
		data.placement.exclusion_zone ={
			other_set: 'minecraft:villages',
			chunk_count: 10,
		}
		data.placement.frequency_reduction_method = 'legacy_type_1'
		data.placement.frequency = 0.2
	}

	const placementType = data.placement.type?.replace(/^minecraft:/, '')
	switch (placementType) {
		case 'concentric_rings':
			data.placement.salt = 0
			data.placement.preferred_biomes = '#minecraft:stronghold_biased_to'
			break
	}
}
