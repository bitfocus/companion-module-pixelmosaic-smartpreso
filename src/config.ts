import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = {
	host: string
	port: number
}

export const DEFAULT_PORT = 10500

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			label: 'Connection',
			width: 12,
			value:
				'Commands are sent over UDP to SP Builder. Use a broadcast address to reach every SP Builder on the peer network ' +
				'(the subnet broadcast address, e.g. 10.11.0.255, is recommended on computers with more than one network adapter), ' +
				'or the IP address of a single SP Builder.',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Destination address',
			width: 8,
			default: '255.255.255.255',
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			width: 4,
			min: 1024,
			max: 49151,
			default: DEFAULT_PORT,
		},
	]
}
