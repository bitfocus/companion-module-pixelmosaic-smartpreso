import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, DEFAULT_PORT, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { OscSender, type OscArg } from './osc.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig // Setup in init()
	private readonly osc = new OscSender()

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()
		await this.applyConfig(config)
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.osc.close()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		await this.applyConfig(config)
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	private async applyConfig(config: ModuleConfig): Promise<void> {
		this.config = { ...config, port: config.port || DEFAULT_PORT }

		if (!this.config.host) {
			this.osc.close()
			this.updateStatus(InstanceStatus.BadConfig, 'Destination address is not set')
			return
		}

		try {
			await this.osc.open((err) => {
				this.log('error', `OSC socket error: ${err.message}`)
				this.updateStatus(InstanceStatus.UnknownError, err.message)
			})
			this.updateStatus(InstanceStatus.Ok)
		} catch (err) {
			this.updateStatus(InstanceStatus.UnknownError, (err as Error).message)
		}
	}

	/** Send one OSC command to the configured destination. Called by every action. */
	async sendOsc(address: string, args: OscArg[]): Promise<void> {
		try {
			await this.osc.send(this.config.host, this.config.port, address, args)
			this.log('debug', `Sent ${address} ${args.map((a) => ('value' in a ? a.value : a.type)).join(' ')}`)
		} catch (err) {
			this.log('error', `Failed to send ${address}: ${(err as Error).message}`)
		}
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}
