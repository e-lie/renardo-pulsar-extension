import { RangeCompatible } from 'atom';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { EventEmitter } from 'events';
import { Logger } from './logging';

export class Pulsardo extends EventEmitter {
	childProcess?: ChildProcessWithoutNullStreams;
	logger?: Logger;

	constructor(logger?: Logger) {
		super();

		this.logger = logger;

		const executable =
			(atom.config.get('pulsardo.renardoExecutablePath') as string) || 'python';

		const samplesDirectory = atom.config.get(
			'pulsardo.samplesDirectory'
		) as string;

		let argumentString = atom.config.get('pulsardo.renardoLaunchArguments') as string;
		let argumentArray: string[] = argumentString.split(",");

		if (samplesDirectory !== '') {
			logger?.service(`Using samples from ${samplesDirectory}.`, false);
			argumentString = argumentString.concat(' -d ').concat(samplesDirectory);
		}

		try {
			this.childProcess = spawn(executable, argumentArray, {
				env: {
					...process.env,
					SC3_PLUGINS: (atom.config.get('pulsardo.useSC3Plugins') as boolean)
						? '1'
						: undefined,
				},
			});

			this.childProcess.stdout.on('data', (data) => {
				logger?.stdout(data);
			});

			this.childProcess.stderr.on('data', (data) => {
				logger?.stderr(data);
			});

			this.childProcess.on('error', (err: Error & { code?: unknown }) => {
				if (err.code === 'ENOENT') {
					logger?.service(
						`Python was not found. Check that you have Python installed. You may need to give the full path to the Python executable in the Pulsardo package's settings.`,
						true
					);
				}
				logger?.service(err.toString(), true);
			});

			this.childProcess.on('close', (code) => {
				if (code) {
					logger?.service(`Pulsardo has exited with code ${code}.`, true);
				} else {
					logger?.service('Pulsardo has stopped.', false);
				}

				this.childProcess = undefined;
				this.emit('stop');
			});

			logger?.service('Pulsardo has started.', false);
		} catch (err: unknown) {
			if (err instanceof Error) {
				logger?.service(err.toString(), true);
			} else {
				logger?.service('Unknown error', true);
			}
		}
	}

	dispose() {
		this.childProcess?.kill();
	}

	clearClock() {
		return this.evaluateCode('Clock.clear()');
	}

	evaluateBlocks() {
		const editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}

		const buffer = editor.getBuffer();
		const lines = buffer.getLines();
		const selectedRanges = editor.getSelectedBufferRanges();
		const ranges = selectedRanges.map((selectedRange) => {
			if (!selectedRange.isEmpty()) {
				return selectedRange;
			}

			const row = selectedRange.start.row;

			let rowBefore = row;
			while (rowBefore >= 0 && lines[rowBefore] !== '') {
				--rowBefore;
			}

			let rowAfter = row;
			while (rowAfter < lines.length && lines[rowAfter] !== '') {
				++rowAfter;
			}

			const range: RangeCompatible = [
				[rowBefore + 1, 0],
				[rowAfter, 0],
			];
			return buffer.clipRange(range);
		});

		return this.evaluateRanges(ranges);
	}

	evaluateCode(code: string) {
		if (!this.childProcess) {
			return;
		}

		const stdin = this.childProcess.stdin;
		stdin.write(code);
		stdin.write('\n\n');

		this.logger?.stdin(code);
	}

	evaluateFile() {
		const editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}

		const range = editor.getBuffer().getRange();
		return this.evaluateRange(range);
	}

	evaluateLines() {
		const editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}

		const buffer = editor.getBuffer();
		const positions = editor.getCursorBufferPositions();
		const ranges = positions.map((position) => {
			const row = position.row;
			return buffer.rangeForRow(row, true);
		});
		return this.evaluateRanges(ranges);
	}

	evaluateRange(range: RangeCompatible) {
		const editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}

		const buffer = editor.getBuffer();

		const marker = editor.markBufferRange(range);
		editor.decorateMarker(marker, {
			class: 'pulsardo-flash',
			type: 'highlight',
		});
		setTimeout(() => {
			marker.destroy();
		}, 300);

		const code = buffer.getTextInRange(range);
		this.evaluateCode(code);
	}

	evaluateRanges(ranges: RangeCompatible[]) {
		return ranges.forEach((range) => this.evaluateRange(range));
	}
}
