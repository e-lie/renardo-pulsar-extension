import { CompositeDisposable } from 'atom';
import autocomplete from './autocomplete';
import { Pulsardo } from './pulsardo';
import { LoggerInWorkspace, LOGGER_IN_WORKSPACE_URI } from './logging';

let pulsardo: Pulsardo | undefined;
let logger: LoggerInWorkspace | undefined;
let subscriptions: CompositeDisposable | undefined;

function start() {
	autocomplete.enabled = true;

	if (atom.config.get('pulsardo.logging.enabled')) {
		logger = new LoggerInWorkspace();
	}

	pulsardo = new Pulsardo(logger);
	pulsardo.on('stop', () => {
		logger?.setTerminated();

		pulsardo = undefined;
		logger = undefined;
	});
}

function stop() {
	pulsardo?.dispose();

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
	renardoExecutablePath: {
		default: '',
		description:
			'If you use packaged renardo/renardo.exe binary give its path here.\nIf you use renardo installed with pip/pipx point to the Python binary (system or virtualenv) where you installed it.\n Default to system Python.',
		type: 'string',
	},
	renardoLaunchArguments: {
		default: '--pipe',
		description:
			'Arguments to start renardo (pipe mode) :\n"--pipe" if you use renardo(.exe) package\nor "-m renardo --pipe" to use as python package.',
		type: 'string',
	},
	samplesDirectory: {
		default: '',
		description:
			'Use an alternate directory for looking up samples (restart Pulsardo session to take effect).',
		type: 'string',
	},
	useSC3Plugins: {
		default: false,
		description: 'Use SC3 plugins (restart Pulsardo session to take effect).',
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
			'pulsardo:clear-clock': (event) => {
				if (!pulsardo) {
					return event.abortKeyBinding();
				} else {
					pulsardo.clearClock();
				}
			},
			'pulsardo:evaluate-blocks': (event) => {
				if (!pulsardo) {
					return event.abortKeyBinding();
				} else {
					pulsardo.evaluateBlocks();
				}
			},
			'pulsardo:evaluate-file': (event) => {
				if (!pulsardo) {
					return event.abortKeyBinding();
				} else {
					pulsardo.evaluateFile();
				}
			},
			'pulsardo:evaluate-lines': (event) => {
				if (!pulsardo) {
					return event.abortKeyBinding();
				} else {
					pulsardo.evaluateLines();
				}
			},
			'pulsardo:toggle': () => {
				if (!pulsardo) {
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
