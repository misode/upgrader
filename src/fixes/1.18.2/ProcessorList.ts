import { Fix } from '../../Fix'

export const Feature = Fix.all(
	Fix.onFile('worldgen/processor_list', ({ data }) => fixProcessorList(data)),
	Fix.onFile('worldgen/template_pool', ({ data }) => fixTemplatePool(data)),
)

function fixProcessorList(data: any) {
	if (typeof data !== 'object') return

	if (!Array.isArray(data.processors)) return

	data.processors.forEach(fixProcessor)
}

function fixProcessor(data: any) {
	if (typeof data !== 'object') return
		
	const type = data.processor_type.replace(/^minecraft:/, '')
	switch (type) {
		case 'protected_blocks':
			if (typeof data.config === 'object') {
				data.value = '#' + data.value
			}
	}
}

function fixTemplatePool(data: any) {
	if (typeof data !== 'object') return

	if (!Array.isArray(data.elements)) return

	data.elements.forEach((el: any) => {
		if (typeof el !== 'object') return
		fixTemplateElement(el.element)
	})
}

function fixTemplateElement(data: any) {
	if (typeof data !== 'object') return
	
	if (typeof data.processors === 'object') {
		fixProcessorList(data.processors)
	}
}
