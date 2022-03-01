import { Fix } from '../../Fix'

export const NoiseSettings = Fix.all(
	Fix.onFile('worldgen/noise_settings', ({ data }) => fixNoiseSettings(data)),
	Fix.onFile('dimension', ({ data }) => {
		if (data.generator?.type?.replace(/^minecraft:/, '') === 'noise') {
			fixNoiseSettings(data.generator.settings)
		}
	}),
)

function fixNoiseSettings(data: any) {
	if (typeof data !== 'object') return

	fixSurfaceRule(data.surface_rule)

	data.noise_router = createNoiseRouter(data.aquifers_enabled, data.ore_veins_enabled, data.noise_caves_enabled, data.noodle_caves_enabled, data.noise.island_noise_override, data.noise.large_biomes)
	delete data.noise_caves_enabled
	delete data.noodle_caves_enabled
	delete data.noise.island_noise_override
	delete data.noise.amplified
	delete data.noise.large_biomes

	// Assuming the vanilla structure sets are good enough, because custom structures weren't possible before anyways
	delete data.structures
}

function fixSurfaceRule(data: any) {
	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'sequence':
			data.sequence.forEach((s: any) => fixSurfaceRule(s))
			break
		case 'condition':
			fixSurfaceCondition(data.if_true)
			fixSurfaceRule(data.then_run)
	}
}

function fixSurfaceCondition(data: any) {
	if (typeof data !== 'object') return
	const condition = data.type.replace(/^minecraft:/, '')
	switch (condition) {
		case 'stone_depth':
			data.secondary_depth_range = data.add_surface_secondary_depth ? 6 : 0
			delete data.add_surface_secondary_depth
	}
}

function createNoiseRouter(aquifersEnabled: boolean, oreVeinsEnabled: boolean, noiseCavesEnabled: boolean, noodleCavesEnabled: boolean, islandNoiseOverride: boolean, largeBiomes: boolean) {
	const prefix = islandNoiseOverride ? 'end' : largeBiomes ? 'overworld_large_biomes' : 'overworld'

	const slopedCheese = !noiseCavesEnabled ? `minecraft:${prefix}/sloped_cheese` : {
		max_exclusive: 1.5625,
		when_in_range: {
			argument1: `minecraft:${prefix}/sloped_cheese`,
			argument2: {
				argument1: 5.0,
				argument2: 'minecraft:overworld/caves/entrances',
				type: 'minecraft:mul',
			},
			type: 'minecraft:min',
		},
		when_out_of_range: {
			argument1: {
				argument1: {
					argument1: {
						argument1: {
							argument1: 4.0,
							argument2: {
								argument: {
									noise: 'minecraft:cave_layer',
									xz_scale: 1.0,
									y_scale: 8.0,
									type: 'minecraft:noise',
								},
								type: 'minecraft:square',
							},
							type: 'minecraft:mul',
						},
						argument2: {
							argument1: {
								input: {
									argument1: 0.27,
									argument2: {
										noise: 'minecraft:cave_cheese',
										xz_scale: 1.0,
										y_scale: 0.6666666666666666,
										type: 'minecraft:noise',
									},
									type: 'minecraft:add',
								},
								min: -1.0,
								max: 1.0,
								type: 'minecraft:clamp',
							},
							argument2: {
								input: {
									argument1: 1.5,
									argument2: {
										argument1: -0.64,
										argument2: `minecraft:${prefix}/sloped_cheese`,
										type: 'minecraft:mul',
									},
									type: 'minecraft:add',
								},
								min: 0.0,
								max: 0.5,
								type: 'minecraft:clamp',
							},
							type: 'minecraft:add',
						},
						type: 'minecraft:add',
					},
					argument2: 'minecraft:overworld/caves/entrances',
					type: 'minecraft:min',
				},
				argument2: {
					argument1: 'minecraft:overworld/caves/spaghetti_2d',
					argument2: 'minecraft:overworld/caves/spaghetti_roughness_function',
					type: 'minecraft:add',
				},
				type: 'minecraft:min',
			},
			argument2: {
				max_exclusive: 0.03,
				when_in_range: -1000000.0,
				when_out_of_range: 'minecraft:overworld/caves/pillars',
				input: 'minecraft:overworld/caves/pillars',
				min_inclusive: -1000000.0,
				type: 'minecraft:range_choice',
			},
			type: 'minecraft:max',
		},
		input: `minecraft:${prefix}/sloped_cheese`,
		min_inclusive: -1000000.0,
		type: 'minecraft:range_choice',
	}
	const postProcessed = {
		argument: {
			argument1: 0.64,
			argument2: {
				argument: {
					argument: {
						argument: slopedCheese,
						type: 'minecraft:slide',
					},
					type: 'minecraft:blend_density',
				},
				type: 'minecraft:interpolated',
			},
			type: 'minecraft:mul',
		},
		type: 'minecraft:squeeze',
	}

	return {
		final_density: !noodleCavesEnabled ? postProcessed : {
			argument1: postProcessed,
			argument2: 'minecraft:overworld/caves/noodle',
			type: 'minecraft:min',
		},
		vein_toggle: !oreVeinsEnabled || islandNoiseOverride ? 0 : {
			argument: {
				max_exclusive: 51.0,
				when_in_range: {
					noise: 'minecraft:ore_veininess',
					xz_scale: 1.5,
					y_scale: 1.5,
					type: 'minecraft:noise',
				},
				when_out_of_range: 0.0,
				input: 'minecraft:y',
				min_inclusive: -60.0,
				type: 'minecraft:range_choice',
			},
			type: 'minecraft:interpolated',
		},
		vein_ridged: !oreVeinsEnabled || islandNoiseOverride ? 0 : {
			argument1: -0.07999999821186066,
			argument2: {
				argument1: {
					argument: {
						argument: {
							max_exclusive: 51.0,
							when_in_range: {
								noise: 'minecraft:ore_vein_a',
								xz_scale: 4.0,
								y_scale: 4.0,
								type: 'minecraft:noise',
							},
							when_out_of_range: 0.0,
							input: 'minecraft:y',
							min_inclusive: -60.0,
							type: 'minecraft:range_choice',
						},
						type: 'minecraft:interpolated',
					},
					type: 'minecraft:abs',
				},
				argument2: {
					argument: {
						argument: {
							max_exclusive: 51.0,
							when_in_range: {
								noise: 'minecraft:ore_vein_b',
								xz_scale: 4.0,
								y_scale: 4.0,
								type: 'minecraft:noise',
							},
							when_out_of_range: 0.0,
							input: 'minecraft:y',
							min_inclusive: -60.0,
							type: 'minecraft:range_choice',
						},
						type: 'minecraft:interpolated',
					},
					type: 'minecraft:abs',
				},
				type: 'minecraft:max',
			},
			type: 'minecraft:add',
		},
		vein_gap: !oreVeinsEnabled || islandNoiseOverride ? 0 : {
			noise: 'minecraft:ore_gap',
			xz_scale: 1.0,
			y_scale: 1.0,
			type: 'minecraft:noise',
		},
		erosion: islandNoiseOverride ? 0 : `minecraft:${prefix}/erosion`,
		depth: islandNoiseOverride ? 0 : `minecraft:${prefix}/depth`,
		ridges: islandNoiseOverride ? 0 : 'minecraft:overworld/ridges',
		initial_density_without_jaggedness: islandNoiseOverride ? {
			argument: {
				type: 'minecraft:end_islands',
			},
			type: 'minecraft:cache_2d',
		} : {
			argument1: 4.0,
			argument2: {
				argument: {
					argument1: `minecraft:${prefix}/depth`,
					argument2: {
						argument: `minecraft:${prefix}/factor`,
						type: 'minecraft:cache_2d',
					},
					type: 'minecraft:mul',
				},
				type: 'minecraft:quarter_negative',
			},
			type: 'minecraft:mul',
		},
		lava: !aquifersEnabled || islandNoiseOverride ? 0 : {
			noise: 'minecraft:aquifer_lava',
			xz_scale: 1.0,
			y_scale: 1.0,
			type: 'minecraft:noise',
		},
		temperature: islandNoiseOverride ? 0 : {
			xz_scale: 0.25,
			y_scale: 0.0,
			noise: largeBiomes ? 'minecraft:temperature_large' : 'minecraft:temperature',
			shift_x: 'minecraft:shift_x',
			shift_y: 0.0,
			shift_z: 'minecraft:shift_z',
			type: 'minecraft:shifted_noise',
		},
		vegetation: islandNoiseOverride ? 0 : {
			xz_scale: 0.25,
			y_scale: 0.0,
			noise: largeBiomes ? 'minecraft:vegetation_large' : 'minecraft:vegetation',
			shift_x: 'minecraft:shift_x',
			shift_y: 0.0,
			shift_z: 'minecraft:shift_z',
			type: 'minecraft:shifted_noise',
		},
		continents: islandNoiseOverride ? 0 : `minecraft:${prefix}/continents`,
		barrier: !aquifersEnabled || islandNoiseOverride ? 0 : {
			noise: 'minecraft:aquifer_barrier',
			xz_scale: 1.0,
			y_scale: 0.5,
			type: 'minecraft:noise',
		},
		fluid_level_floodedness: !aquifersEnabled || islandNoiseOverride ? 0 : {
			noise: 'minecraft:aquifer_fluid_level_floodedness',
			xz_scale: 1.0,
			y_scale: 0.67,
			type: 'minecraft:noise',
		},
		fluid_level_spread: !aquifersEnabled || islandNoiseOverride ? 0 : {
			noise: 'minecraft:aquifer_fluid_level_spread',
			xz_scale: 1.0,
			y_scale: 0.7142857142857143,
			type: 'minecraft:noise',
		},
	}
}
