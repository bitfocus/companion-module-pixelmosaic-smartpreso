import type { CompanionOptionValues, JsonValue, SomeCompanionActionInputField } from '@companion-module/base'
import type ModuleInstance from './main.js'
import { COMMANDS, type ArgDef, type CommandDef } from './commands.js'
import { oscBool, oscFloat, oscInt, oscString, type OscArg } from './osc.js'

// Actions are generated from the command table, so the schema is a generic record.
export type ActionsSchema = Record<string, { options: CompanionOptionValues }>

const TARGET_FIELD: SomeCompanionActionInputField = {
	type: 'textinput',
	id: 'target',
	label: 'Target',
	tooltip: '"all", one IP address, or several IP addresses separated by commas',
	default: 'all',
	useVariables: true,
}

const RELAY_ARG: ArgDef = { kind: 'bool', id: 'relay', label: 'Relay to connected Player devices', default: true }

export function argsFor(cmd: CommandDef): ArgDef[] {
	return cmd.relay ? [...cmd.args, RELAY_ARG] : cmd.args
}

function fieldFor(arg: ArgDef): SomeCompanionActionInputField {
	switch (arg.kind) {
		case 'int':
			return {
				type: 'number',
				id: arg.id,
				label: arg.label,
				default: arg.default,
				min: arg.min,
				max: arg.max,
				asInteger: true,
			}
		case 'float':
			return {
				type: 'number',
				id: arg.id,
				label: arg.label,
				default: arg.default,
				min: arg.min,
				max: arg.max,
				step: arg.step ?? 1,
			}
		case 'string':
			return { type: 'textinput', id: arg.id, label: arg.label, default: arg.default, useVariables: true }
		case 'bool':
			return { type: 'checkbox', id: arg.id, label: arg.label, default: arg.default }
		case 'color':
			return { type: 'colorpicker', id: arg.id, label: arg.label, default: arg.default, returnType: 'number' }
		case 'choice':
			return { type: 'dropdown', id: arg.id, label: arg.label, default: arg.default, choices: arg.choices }
	}
}

/** Turn one option value into an OSC argument. Returns an error message instead if the value is unusable. */
function oscArgFor(arg: ArgDef, value: JsonValue | undefined): OscArg | string {
	switch (arg.kind) {
		case 'int':
		case 'choice': {
			const n = Number(value)
			return Number.isInteger(n) ? oscInt(n) : `${arg.label} must be a whole number`
		}
		case 'float': {
			const n = Number(value)
			return Number.isFinite(n) ? oscFloat(n * (arg.scale ?? 1)) : `${arg.label} must be a number`
		}
		case 'string': {
			const s = typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''
			return s.length > 0 ? oscString(s) : `${arg.label} is empty`
		}
		case 'bool':
			return oscBool(Boolean(value))
		case 'color': {
			// Smart Preso expects a hex string like "#FF7700"
			const n = typeof value === 'number' ? value : Number(value)
			if (!Number.isFinite(n)) return `${arg.label} is not a valid color`
			return oscString('#' + (n & 0xffffff).toString(16).padStart(6, '0').toUpperCase())
		}
	}
}

/** "all" | "10.0.0.5" | "10.0.0.5, 10.0.0.6" -> the second segment of the OSC address */
export function formatTarget(raw: string): string {
	const parts = raw
		.replace(/[{}\s]/g, '')
		.split(',')
		.filter((p) => p.length > 0)
	if (parts.length === 0) return 'all'
	if (parts.length === 1) return parts[0]
	return `{${parts.join(',')}}`
}

export function UpdateActions(self: ModuleInstance): void {
	const definitions: Record<string, unknown> = {}

	for (const cmd of COMMANDS) {
		const args = argsFor(cmd)
		definitions[cmd.id] = {
			name: cmd.name,
			description: cmd.description,
			options: [TARGET_FIELD, ...args.map(fieldFor)],
			callback: async (event: { options: CompanionOptionValues }) => {
				const oscArgs: OscArg[] = []
				for (const arg of args) {
					const result = oscArgFor(arg, event.options[arg.id])
					if (typeof result === 'string') {
						self.log('warn', `${cmd.name}: ${result}, command not sent`)
						return
					}
					oscArgs.push(result)
				}
				const target = formatTarget(typeof event.options.target === 'string' ? event.options.target : '')
				await self.sendOsc(`/sp/${target}/${cmd.path}`, oscArgs)
			},
		}
	}

	self.setActionDefinitions(definitions as Parameters<ModuleInstance['setActionDefinitions']>[0])
}
