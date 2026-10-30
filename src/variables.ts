import type ModuleInstance from './main.js'

// No state comes back from Smart Preso yet, so the module exposes no variables.
export type VariablesSchema = Record<string, never>

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions({})
}
