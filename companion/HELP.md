## Smart Preso

Controls [Smart Preso](https://smartpreso.com) systems over OSC. Commands are received by **SP Builder** (and, for some commands, SP MultiScreen and SP PreViz).

Full command reference: [Smart Preso OSC API Documentation](https://cloud.smartpreso.com/?action=oscDocumentation)

### Configuration

- **Destination address**: where commands are sent.
  - A broadcast address reaches every SP Builder on the network. On computers with more than one network adapter, use the subnet broadcast address of the peer network (e.g. `10.11.0.255`) rather than `255.255.255.255`.
  - Or the IP address of a single SP Builder.
- **Port**: must match the OSC port set in SP Builder (default `10500`).

### Targeting

Every action has a **Target** field:

- `all` (the default): every device that receives the command
- `10.11.0.11`: one device
- `10.11.0.11, 10.11.0.12`: several devices

Because targets are part of the command itself, one broadcast can still be directed at specific devices.

### Actions

- **Cue List**: Activate, Take (run) current Cue List Item, Select next / previous Cue List Item, Select Cue List Item
- **Cue Sequence**: Activate, Play, Go to Cue Column, Go to Marker
- **Timeline Cue**: Play, Stop, Go to time, Go to Marker (Compositions), Set transform / rotation / crop / opacity / color / volume
- **System**: Set test pattern

Opacity and volume are entered as percentages (0–100).

The "Relay to connected Player devices" option on the Timeline Cue property actions controls whether SP Builder forwards the change to its Player devices. Turn it off when the same command is also being sent directly to the Players.

### Feedback

Smart Preso does not currently report state back to Companion, so this module has no feedbacks or variables. Errors (for example, a Cue List name that doesn't exist) are reported in SP Builder's console/log.
