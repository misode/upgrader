import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { FixConfig } from '../Fix'
import { Pack } from '../Pack'
import type { VersionOrAuto } from '../Version'
import { Version } from '../Version'
import { Octicon } from './Octicon'

type AlertData = {
	message: string,
	files?: string[],
	info?: string[],
}

type PromptData = {
	title: string,
	message?: string,
	actions: string[],
	info?: string[],
}

type PackCardProps = {
	pack: Pack,
	config: FixConfig,
	source: VersionOrAuto,
	target: Version,
	doDownload: number,
	onError: (error: Error) => unknown,
	onRemove: () => unknown,
	onDone: () => unknown,
}
export function PackCard({ pack, config, source, target, onError, onRemove, onDone, doDownload }: PackCardProps) {
	const [status, setStatus] = useState('Loading...')
	const [download, setDownload] = useState<string | null>(null)
	const [alerts, setAlerts] = useState<AlertData[]>([])
	const [error, setError] = useState<string | null>(null)
	const [alertsHidden, setAlertsHidden] = useState(false)
	const [prompt, setPrompt] = useState<PromptData | null>(null)
	const downloadRef = useRef<HTMLAnchorElement>(null)
	const promptDone = useRef<(value: string) => void>(() => {})

	const downloadName = `${pack.name}_${target}.zip`
	const detectedSource = useMemo(() => {
		if (source !== 'auto') return source
		return Version.autoDetect(pack.meta.data.pack.pack_format) ?? '???'
	}, [])
	const detectedTarget = useMemo(() => {
		return target
	}, [])

	const onPrompt = (title: string, message?: string, actions?: string[], info?: string[]) => {
		setPrompt({ title, message, actions: actions ?? ['Confirm'], info })
		return new Promise<string>((res) => {
			promptDone.current = (value) => {
				setPrompt(null)
				res(value)
			}
		})
	}

	const onWarning = (message: string, files?: string[], info?: string[]) => {
		setTimeout(() => setAlerts(alerts => [...alerts, { message, files, info }]))
	}

	useEffect(() => {
		(async () => {
			try {
				setStatus('Upgrading...')
				await Pack.upgrade(pack, { features: config, source, target, onPrompt, onWarning })
				setStatus('Zipping...')
				const download = await Pack.toZip(pack)
				setDownload(download)
				onDone()
			} catch (e: any) {
				onError(e)
				setError('Error during upgrading')
			}
		})()
	}, [pack])

	const toggleAlerts = () => {
		setAlertsHidden(!alertsHidden)
	}

	useEffect(() => {
		if (doDownload) {
			downloadRef.current.click()
		}
	}, [doDownload])

	return <div class="pack">
		<div class="pack-head">
			{download && <a class="pack-status download" ref={downloadRef} href={download} download={downloadName} data-hover={`Download data pack for ${target}`}>
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
			<span class="pack-version">{Version.displayName(detectedSource)} → {Version.displayName(detectedTarget)}</span>
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
				{prompt.info?.map(line => <p class="prompt-info">{line}</p>)}
			</div>}
			{(alerts.length > 0 && !alertsHidden) && alerts.map(({ message, files, info }) => <div class="pack-alert">
				<div class={`alert-message ${message.startsWith('!') ? 'alert-error' : ''}`}>{message.replace(/\!/, '')}</div>
				{files && files.length > 0 && <>
					<p>Affected files:</p>
					<div class="alert-files">{files.map(file => <p>{file}</p>)}</div>
				</>}
				{info?.map(line => <p class="alert-info">{line}</p>)}
			</div>)}
		</div>}
	</div>
}
