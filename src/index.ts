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
	renardoWebSocketAddress: {
		default: 'localhost:15678',
		description:
			'IP address and port of the renardo websocket server to connect to. Default to localhost with port 15678',
		type: 'string',
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
