"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = exports.provideAutocomplete = exports.deactivate = exports.activate = exports.config = void 0;
const atom_1 = require("atom");
const autocomplete_1 = __importDefault(require("./autocomplete"));
const renardo_1 = require("./renardo");
const logging_1 = require("./logging");
let renardo;
let logger;
let subscriptions;
function start() {
    autocomplete_1.default.enabled = true;
    if (atom.config.get('renardo.logging.enabled')) {
        logger = new logging_1.LoggerInWorkspace();
    }
    renardo = new renardo_1.Renardo(logger);
    renardo.on('stop', () => {
        logger === null || logger === void 0 ? void 0 : logger.setTerminated();
        renardo = undefined;
        logger = undefined;
    });
}
function stop() {
    renardo === null || renardo === void 0 ? void 0 : renardo.dispose();
    autocomplete_1.default.enabled = false;
}
exports.config = {
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
        description: 'Leave empty to use python from the PATH environment variable.',
        type: 'string',
    },
    samplesDirectory: {
        default: '',
        description: 'Use an alternate directory for looking up samples (restart Renardo session to take effect).',
        type: 'string',
    },
    useSC3Plugins: {
        default: false,
        description: 'Use SC3 plugins (restart Renardo session to take effect).',
        type: 'boolean',
    },
};
function activate() {
    subscriptions = new atom_1.CompositeDisposable(atom.workspace.addOpener((uri) => {
        if (uri === logging_1.LOGGER_IN_WORKSPACE_URI) {
            return new logging_1.LoggerInWorkspace();
        }
        return undefined;
    }), atom.commands.add('atom-workspace', {
        'renardo:clear-clock': (event) => {
            if (!renardo) {
                return event.abortKeyBinding();
            }
            else {
                renardo.clearClock();
            }
        },
        'renardo:evaluate-blocks': (event) => {
            if (!renardo) {
                return event.abortKeyBinding();
            }
            else {
                renardo.evaluateBlocks();
            }
        },
        'renardo:evaluate-file': (event) => {
            if (!renardo) {
                return event.abortKeyBinding();
            }
            else {
                renardo.evaluateFile();
            }
        },
        'renardo:evaluate-lines': (event) => {
            if (!renardo) {
                return event.abortKeyBinding();
            }
            else {
                renardo.evaluateLines();
            }
        },
        'renardo:toggle': () => {
            if (!renardo) {
                start();
            }
            else {
                stop();
            }
        },
    }));
}
exports.activate = activate;
function deactivate() {
    stop();
    if (subscriptions) {
        subscriptions.dispose();
    }
}
exports.deactivate = deactivate;
function provideAutocomplete() {
    return autocomplete_1.default;
}
exports.provideAutocomplete = provideAutocomplete;
function serialize() {
    return {};
}
exports.serialize = serialize;
