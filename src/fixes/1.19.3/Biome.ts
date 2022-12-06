import { Fix } from '../../Fix'
import type { PackFile } from '../../Pack'

let SOUND_EVENTS: Set<string> | undefined

async function getSoundEvents() {
	if (SOUND_EVENTS === undefined) {
		const res = await fetch('https://raw.githubusercontent.com/misode/mcmeta/registries/sound_event/data.min.json')
		const data = await res.json()
		SOUND_EVENTS = new Set(data)
	}
	return SOUND_EVENTS
}

export const Biome = Fix.all(
	Fix.onFile('worldgen/biome', fixBiome),
)

async function fixBiome({ data }: PackFile) {
	if (typeof data !== 'object') return

	await fixEffects(data.effects)
}

async function fixEffects(data: any) {
	if (typeof data !== 'object') return

	const soundEvents = await getSoundEvents()

	if (data.ambient_sound) {
		data.ambient_sound = convertSoundEvent(data.ambient_sound, soundEvents)
	}
	if (data.mood_sound) {
		data.mood_sound.sound = convertSoundEvent(data.mood_sound.sound, soundEvents)
	}
	if (data.additions_sound) {
		data.additions_sound.sound = convertSoundEvent(data.additions_sound.sound, soundEvents)
	}
}

function convertSoundEvent(data: any, soundEvents: Set<string>) {
	if (typeof data !== 'string') return data

	if (soundEvents.has(data.replace(/^minecraft:/, ''))) return data

	return {
		sound_id: data,
	}
}
