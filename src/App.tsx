import { useState } from 'preact/hooks'
import { Octicon } from './components/Octicon'
import { PackCard } from './components/PackCard'
import { Pack } from './Pack'

export type AppError = {
	process: 'loading' | 'upgrading',
	error: Error,
}

export function App() {
	const [packs, setPacks] = useState<Pack[]>([])
	const [errors, setErrors] = useState<AppError[]>([])

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
		if (promises.length > 0) {
			const newPacks = await Promise.all(promises.map(async promise => {
				try {
					return await promise
				} catch (error) {
					setErrors([...errors, { process: 'loading', error }])
					console.error(error)
					return
				}
			}))
			setPacks([...packs, ...newPacks.filter((p): p is Pack => p !== undefined)])
		}
	}

	const onUpgradeError = (error: Error) => {
		console.error(error)
		setErrors([...errors, { process: 'upgrading', error }])
	}

	return <main onDrop={onDrop} onDragOver={e => e.preventDefault()}>
		{packs.length === 0 ? <>
			<div class="drop">
				<h1>Drop data pack here</h1>
				<p>Converts from 1.16.5 to 1.17</p>
			</div>
		</> : <>
			<div class="packs">
				{packs.map(pack => <PackCard pack={pack} onError={onUpgradeError} />)}
			</div>
			<div class="footer">
				<p>Developed by Misode</p>
				<p>Source code on <a href="https://github.com/misode/upgrader" target="_blank">GitHub</a></p>
			</div>
		</>}
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
