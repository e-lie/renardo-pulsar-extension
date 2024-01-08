import { CompositeDisposable } from 'atom';
import autocomplete from './autocomplete';
import { Renardo } from './renardo';
import { LoggerInWorkspace, LOGGER_IN_WORKSPACE_URI } from './logging';

let renardo: Renardo | undefined;
let logger: LoggerInWorkspace | undefined;
let subscriptions: CompositeDisposable | undefined;

function start() {
	autocomplete.enabled = true;

	if (atom.config.get('renardo.logging.enabled')) {
		logger = new LoggerInWorkspace();
	}

	renardo = new Renardo(logger);
	renardo.on('stop', () => {
		logger?.setTerminated();

		renardo = undefined;
		logger = undefined;
	});
}

function stop() {
	renardo?.dispose();

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
			'Use an alternate directory for looking up samples (restart Renardo session to take effect).',
		type: 'string',
	},
	useSC3Plugins: {
		default: false,
		description: 'Use SC3 plugins (restart Renardo session to take effect).',
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
			'renardo:clear-clock': (event) => {
				if (!renardo) {
					return event.abortKeyBinding();
				} else {
					renardo.clearClock();
				}
			},
			'renardo:evaluate-blocks': (event) => {
				if (!renardo) {
					return event.abortKeyBinding();
				} else {
					renardo.evaluateBlocks();
				}
			},
			'renardo:evaluate-file': (event) => {
				if (!renardo) {
					return event.abortKeyBinding();
				} else {
					renardo.evaluateFile();
				}
			},
			'renardo:evaluate-lines': (event) => {
				if (!renardo) {
					return event.abortKeyBinding();
				} else {
					renardo.evaluateLines();
				}
			},
			'renardo:toggle': () => {
				if (!renardo) {
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
