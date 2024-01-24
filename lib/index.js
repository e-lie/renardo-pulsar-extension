"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = exports.provideAutocomplete = exports.deactivate = exports.activate = exports.config = void 0;
const atom_1 = require("atom");
const autocomplete_1 = __importDefault(require("./autocomplete"));
const pulsardo_1 = require("./pulsardo");
const logging_1 = require("./logging");
let pulsardo;
let logger;
let subscriptions;
function start() {
    autocomplete_1.default.enabled = true;
    if (atom.config.get('pulsardo.logging.enabled')) {
        logger = new logging_1.LoggerInWorkspace();
    }
    pulsardo = new pulsardo_1.Pulsardo(logger);
    pulsardo.on('stop', () => {
        logger === null || logger === void 0 ? void 0 : logger.setTerminated();
        pulsardo = undefined;
        logger = undefined;
    });
}
function stop() {
    pulsardo === null || pulsardo === void 0 ? void 0 : pulsardo.dispose();
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
        description: 'Use an alternate directory for looking up samples (restart Pulsardo session to take effect).',
        type: 'string',
    },
    useSC3Plugins: {
        default: false,
        description: 'Use SC3 plugins (restart Pulsardo session to take effect).',
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
        'pulsardo:clear-clock': (event) => {
            if (!pulsardo) {
                return event.abortKeyBinding();
            }
            else {
                pulsardo.clearClock();
            }
        },
        'pulsardo:evaluate-blocks': (event) => {
            if (!pulsardo) {
                return event.abortKeyBinding();
            }
            else {
                pulsardo.evaluateBlocks();
            }
        },
        'pulsardo:evaluate-file': (event) => {
            if (!pulsardo) {
                return event.abortKeyBinding();
            }
            else {
                pulsardo.evaluateFile();
            }
        },
        'pulsardo:evaluate-lines': (event) => {
            if (!pulsardo) {
                return event.abortKeyBinding();
            }
            else {
                pulsardo.evaluateLines();
            }
        },
        'pulsardo:toggle': () => {
            if (!pulsardo) {
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
