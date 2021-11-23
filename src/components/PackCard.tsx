import { useEffect, useRef, useState } from 'preact/hooks'
import type { FixConfig, FixPrompt } from '../Fix'
import { Pack } from '../Pack'
import type { Version } from '../Version'
import { Octicon } from './Octicon'

type AlertData = {
	message: string,
	files?: string[],
}

type PromptData = {
	title: string,
	message?: string,
	actions: string[],
}

type PackCardProps = {
	pack: Pack,
	config: FixConfig,
	source: Version,
	target: Version,
	onError: (error: Error) => unknown,
	onRemove: () => unknown,
}
export function PackCard({ pack, config, source, target, onError, onRemove }: PackCardProps) {
	const [status, setStatus] = useState('Loading...')
	const [download, setDownload] = useState<string | null>(null)
	const [alerts, setAlerts] = useState<AlertData[]>([])
	const [error, setError] = useState<string | null>(null)
	const [alertsHidden, setAlertsHidden] = useState(false)
	const [prompt, setPrompt] = useState<PromptData | null>(null)
	const promptDone = useRef<(value: string) => void>(() => {})

	const downloadName = pack.name.replace(/\.zip$/, `_${target}.zip`)

	const onPrompt: FixPrompt = (title, message, actions) => {
		setPrompt({ title, message, actions: actions ?? ['Confirm'] })
		return new Promise((res) => {
			promptDone.current = (value) => {
				setPrompt(null)
				res(value)
			}
		})
	}

	const onWarning = (message: string, files?: string[]) => {
		setTimeout(() => setAlerts(alerts => [...alerts, { message, files}]))
	}

	useEffect(() => {
		(async () => {
			try {
				setStatus('Upgrading...')
				await Pack.upgrade(pack, { features: config, source, target, onPrompt, onWarning })

				setStatus('Zipping...')
				const download = await Pack.toZip(pack)
				setDownload(download)
			} catch (e: any) {
				onError(e)
				setError('Error during upgrading')
			}
		})()
	}, [pack])

	const toggleAlerts = () => {
		setAlertsHidden(!alertsHidden)
	}

	return <div class="pack">
		<div class="pack-head">
			{download && <a class="pack-status download" href={download} download={downloadName} data-hover={`Download data pack for ${target}`}>
				{Octicon.download}
			</a>}
			{(!download && !error && !prompt) && <div class="pack-status loading" data-hover={status}>
				{Octicon.sync}
			</div>}
			{!download && !error && prompt && <div class="pack-status prompt" data-hover="Manual action required">
				{Octicon.report}
			</div>}
			{(alerts.length > 0 || error) && <div class={`pack-status alert${error ? ' error' : ''}`} onClick={toggleAlerts} data-hover={error ?? 'There were issues upgrading'}>
				{Octicon.alert}
			</div>}
			<span class="pack-name">{pack.name.replace(/\.zip$/, '')}</span>
			<div class="pack-status remove" onClick={onRemove}>
				{Octicon.x}
			</div>
		</div>
		{(prompt || (alerts.length > 0 && !alertsHidden)) && <div class="pack-body">
			{prompt && <div class="pack-prompt">
				<p class="prompt-title">{prompt.title}</p>
				{prompt.message && <p class="prompt-message">{prompt.message}</p>}
				<p>
					{prompt.actions.map(action => (
						<button onClick={() => promptDone.current(action)}>{action}</button>
					))}
				</p>
			</div>}
			{(alerts.length > 0 && !alertsHidden) && alerts.map(({ message, files }) => <div class="pack-alert">
				<div class="alert-message">{message}</div>
				{files && files.length > 0 && <>
					<p>Affected files:</p>
					<div class="alert-files">{files.map(file => <p>{file}</p>)}</div>
				</>}
			</div>)}
		</div>}
	</div>
}
