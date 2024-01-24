import { CompositeDisposable } from 'atom';
import autocomplete from './autocomplete';
import { Renardoo } from './renardoo';
import { LoggerInWorkspace, LOGGER_IN_WORKSPACE_URI } from './logging';

let renardoo: Renardoo | undefined;
let logger: LoggerInWorkspace | undefined;
let subscriptions: CompositeDisposable | undefined;

function start() {
	autocomplete.enabled = true;

	if (atom.config.get('renardoo.logging.enabled')) {
		logger = new LoggerInWorkspace();
	}

	renardoo = new Renardoo(logger);
	renardoo.on('stop', () => {
		logger?.setTerminated();

		renardoo = undefined;
		logger = undefined;
	});
}

function stop() {
	renardoo?.dispose();

	autocomplete.enabled = false;
}

export const config = {
	logging: {
		properties: {
			enabled: {
				default: true,
				description: 'Takes effect at the next plugin startup.',
				type: 'boolean',
			},
			logServiceMessages: {
				default: true,
				type: 'boolean',
			},
			logStderr: {
				default: true,
				type: 'boolean',
			},
			logStdin: {
				default: true,
				type: 'boolean',
			},
			logStdout: {
				default: true,
				type: 'boolean',
			},
		},
		type: 'object',
	},
	pythonPath: {
		default: '',
		description:
			'Leave empty to use python from the PATH environment variable.',
		type: 'string',
	},
	samplesDirectory: {
		default: '',
		description:
			'Use an alternate directory for looking up samples (restart Renardoo session to take effect).',
		type: 'string',
	},
	useSC3Plugins: {
		default: false,
		description: 'Use SC3 plugins (restart Renardoo session to take effect).',
		type: 'boolean',
	},
};

export function activate() {
	subscriptions = new CompositeDisposable(
		atom.workspace.addOpener((uri) => {
			if (uri === LOGGER_IN_WORKSPACE_URI) {
				return new LoggerInWorkspace();
			}
			return undefined;
		}),

		atom.commands.add('atom-workspace', {
			'renardoo:clear-clock': (event) => {
				if (!renardoo) {
					return event.abortKeyBinding();
				} else {
					renardoo.clearClock();
				}
			},
			'renardoo:evaluate-blocks': (event) => {
				if (!renardoo) {
					return event.abortKeyBinding();
				} else {
					renardoo.evaluateBlocks();
				}
			},
			'renardoo:evaluate-file': (event) => {
				if (!renardoo) {
					return event.abortKeyBinding();
				} else {
					renardoo.evaluateFile();
				}
			},
			'renardoo:evaluate-lines': (event) => {
				if (!renardoo) {
					return event.abortKeyBinding();
				} else {
					renardoo.evaluateLines();
				}
			},
			'renardoo:toggle': () => {
				if (!renardoo) {
					start();
				} else {
					stop();
				}
			},
		})
	);
}

export function deactivate() {
	stop();
	if (subscriptions) {
		subscriptions.dispose();
	}
}

export function provideAutocomplete() {
	return autocomplete;
}

export function serialize() {
	return {};
}
