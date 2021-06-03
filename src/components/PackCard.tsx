import { useEffect, useState } from 'preact/hooks'
import { Pack } from '../Pack'
import { Octicon } from './Octicon'

export function PackCard({ pack }: { pack: Pack }) {
	const [download, setDownload] = useState<string | null>(null)
	const downloadName = `${pack.name.replace(/\.zip$/, '')}_1_17.zip`

	useEffect(() => {
		Pack.upgrade(pack)
			.then(() => Pack.toZip(pack))
			.then(download => setDownload(download))
	}, [pack])

	return <div class="pack">
		{download ? <a class="pack-status" href={download} download={downloadName}>
			{Octicon.download}
		</a> : <div class="pack-status loading">
			{Octicon.loading}
		</div>}
		<span>{pack.name.replace(/\.zip$/, '')}</span>
	</div>
}
