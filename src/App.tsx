import { useState } from 'preact/hooks'
import { Config } from './components/Config'
import { Octicon } from './components/Octicon'
import { PackCard } from './components/PackCard'
import { VersionPicker } from './components/VersionPicker'
import type { FixConfig } from './Fix'
import { Pack } from './Pack'
import { Store } from './Store'
import { Version } from './Version'

export type AppError = {
	process: 'loading' | 'upgrading',
	error: Error,
}

export function App() {
	const [packs, setPacks] = useState<Pack[]>([])
	const [errors, setErrors] = useState<AppError[]>([])
	const [source, setSource] = useState<Version>(Store.getSource())
	const [target, setTarget] = useState<Version>(Store.getTarget())
	const [config, setConfig] = useState<FixConfig>({
		functions: true,
		ids: true,
		predicates: true,
		worldgen: true,
		packFormat: true,
		featureCycles: true,
	})
	const changeSource = (source: Version) => {
		Store.setSource(source)
		setSource(source)
	}
	const changeTarget = (target: Version) => {
		Store.setTarget(target)
		setTarget(target)
	}

	const onDrop = async (e: DragEvent) => {
		e.preventDefault()
		if(!e.dataTransfer) return

		const promises = []
		for (let i = 0; i < e.dataTransfer.files.length; i++) {
			const file = e.dataTransfer.files[i]
			if (file.type.match(/^application\/(x-)?zip(-compressed)?$/)) {
				promises.push(Pack.fromZip(file))
			}
		}
		if (promises.length === 0) {
			setErrors([...errors, {
				process: 'loading',
				error: new Error('The dropped files contain no zip files. Please zip the data pack first.'),
			}])
		} else {
			const newPacks = await Promise.all(promises.map(async promise => {
				try {
					return await promise
				} catch (error: any) {
					setErrors([...errors, { process: 'loading', error }])
					console.error(error)
					return
				}
			}))
			setPacks([...packs, ...newPacks.flat().filter((p): p is Pack => p !== undefined)])
		}
	}

	const onUpgradeError = (error: Error) => {
		console.error(error)
		setErrors([...errors, { process: 'upgrading', error }])
	}

	const removePack = (id: string) => {
		setPacks(packs => packs.filter(p => p.id !== id))
	}

	const [doDownload, setDownload] = useState(0)

	return <main onDrop={onDrop} onDragOver={e => e.preventDefault()}>
		{packs.length > 0 && <>
			<div class="packs">
				{packs.map(pack => <PackCard key={pack.id} {...{pack, config, source, target, doDownload}} onError={onUpgradeError} onRemove={() => removePack(pack.id)} onDone={() => setPacks([...packs])} />)}
				{packs.filter(p => p.status === 'done').length > 1 &&
					<button class="download-all" onClick={() => setDownload(doDownload + 1)}>
						{Octicon.download}
						<span>Download all</span>
					</button>}
			</div>
		</>}
		<div class="drop">
			<h1>Drop data pack here</h1>
			<p>Convert from <VersionPicker value={source} onChange={changeSource}/> to <VersionPicker value={target} onChange={changeTarget}/></p>
			{Version.order(target, source)
				? <p class="error-message">Invalid version range</p>
				: null}
		</div>
		<div class="configs">
			<Config name="Upgrade functions" value={config.functions} onChange={v => setConfig({ ...config, functions: v })} />
			<Config name="Upgrade IDs" value={config.ids} onChange={v => setConfig({ ...config, ids: v })} />
			<Config name="Upgrade JSON files" value={config.predicates} onChange={v => setConfig({ ...config, predicates: v })} />
			<Config name="Upgrade worldgen" value={config.worldgen} onChange={v => setConfig({ ...config, worldgen: v })} />
			<Config name="Upgrade pack_format" value={config.packFormat} onChange={v => setConfig({ ...config, packFormat: v })} />
			<Config name="Detect feature cycles" value={config.featureCycles} onChange={v => setConfig({ ...config, featureCycles: v })} />
		</div>
		<div class="footer">
			<p>Developed by Misode</p>
			<p>Source code on <a href="https://github.com/misode/upgrader" target="_blank">GitHub</a></p>
		</div>
		<div class="main-errors">
			{errors.map(e => {
				const title = `${e.error.name}: ${e.error.message}`
				const body = `An error occurred while ${e.process} a data pack.\nData Pack: <!-- ATTACH YOUR DATAPACK HERE -->\n\n\`\`\`\n${e.error.stack}\n\`\`\`\n`
				const url = `https://github.com/misode/upgrader/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}\n`
				return <div class="main-error">
					<p>Something went wrong {e.process} the data pack:</p>
					<p class="error-message">{e.error.message}</p>
					<p>You can report this as a bug <a href={url} target="_blank">on GitHub</a> and upload the data pack</p>
					<div class="error-close" onClick={() => setErrors(errors.filter(f => f.error.message !== e.error.message || f.process !== e.process))}>{Octicon.x}</div>
				</div>})}
		</div>
	</main>
}
