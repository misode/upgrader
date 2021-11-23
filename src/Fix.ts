import type { categories, Pack, PackFile } from './Pack'
import { Version } from './Version'

export type Fix = (pack: Pack, ctx: FixContext) => Promise<unknown>

export namespace Fix {
	/**
	 * Runs each fix after each other
	 */
	export function all(...fixes: Fix[]): Fix {
		return async (pack, ctx) => {
			for (const fix of fixes) {
				await fix(pack, ctx)
			}
		}
	}

	/**
	 * A simple fix that runs on one file category
	 */
	export function onFile(category: typeof categories[number] | 'functions', fix: (file: PackFile, ctx: FixContext) => unknown): Fix {
		return async (pack, ctx) => {
			for (const file of pack.data[category]) {
				const fileCtx: FixContext = {
					...ctx,
					warn: (message: string) => ctx.warn(message, [file.name]),
				}
				try {
					await fix(file, fileCtx)
				} catch (e: any) {
					const error = new Error(`Error fixing ${category.replace(/^worldgen\//, '').replaceAll('_', ' ')} ${file.name}: ${e.message}`)
					error.stack = e.stack
					console.warn(error)
					throw error
				}
			}
		}
	}

	export function groupProblems(...fixes: Fix[]): Fix {
		return async (pack, ctx) => {
			// Mapping messages to a list of affected files
			const problems: Record<string, string[]> = {}
			const groupCtx = {
				...ctx,
				warn: (message: string, files?: string[]) => {
					if (files === undefined) {
						problems[message] = []
					} else {
						files.forEach(file => {
							(problems[message] ??= []).push(file)
						})
					}
				},
			}
			await Fix.all(...fixes)(pack, groupCtx)
			Object.entries(problems).forEach(([message, files]) =>
				ctx.warn(message, [...new Set(files)]))
		}
	}

	export function when(key: keyof FixConfig, ...fixes: Fix[]): Fix {
		return async (pack, ctx) => {
			if (ctx.config(key)) {
				await Fix.all(...fixes)(pack, ctx)
			}
		}
	}

	export function assert(predicate: (pack: Pack, ctx: FixContext) => boolean, message: string): Fix {
		return async (pack, ctx) => {
			if (!predicate(pack, ctx)) {
				throw new Error(message)
			}
		}
	}

	export function version(from: Version, to: Version, ...fixes: Fix[]): Fix {
		return async (pack, ctx) => {
			if (Version.includes(ctx.source(), ctx.target(), from, to)) {
				await Fix.all(...fixes)(pack, ctx)
			}
		}
	}

	export function versionInclusive(from: Version, to: Version, ...fixes: Fix[]): Fix {
		return async (pack, ctx) => {
			if (Version.includesInclusive(ctx.source(), ctx.target(), from, to)) {
				await Fix.all(...fixes)(pack, ctx)
			}
		}
	}

	export function debug(message: string): Fix {
		return async () => {
			console.debug(message)
		}
	}
}

export type FixConfig = {
	functions: boolean,
	ids: boolean,
	predicates: boolean,
	worldgen: boolean,
	packFormat: boolean,
}

export type FixPrompt = (title: string, prompt?: string, actions?: string[]) => Promise<string>

export interface FixContext {
	warn: (message: string, files?: string[]) => unknown
	config: (key: keyof FixConfig) => boolean
	read: (category: string, name: string) => PackFile | undefined,
	create: (category: string, name: string, data: any) => unknown,
	source: () => Version,
	target: () => Version,
	prompt: FixPrompt,
}
