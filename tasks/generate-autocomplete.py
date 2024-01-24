import json
import Pulsardo
from operator import itemgetter

constants = [
	'Clock',
	'DefaultServer',
	'Group',
	'inf',
	'Root',
	'Samples',
	'Scale',
]

functions = [
	'expvar',
	'linvar',
	'mapvar',
	'P',
	'Pvar',
	'var',
]

keywords = [
	'when',
]

variables = [
	'Clock.bpm',
	'Scale.default',
]

suggestions = []

def make_suggestion(name, type, container=None):
	suggestion = {
		'text': name,
		'type': type,
	}
	if container is not None:
		doc = getattr(container, name).__doc__
		if doc is not None:
			suggestion['description'] = doc.strip()
	return suggestion

suggestions.extend([make_suggestion(name, 'constant', Pulsardo) for name in constants])
suggestions.extend([make_suggestion(name, 'function', Pulsardo) for name in functions])
suggestions.extend([make_suggestion(name, 'keyword') for name in keywords])
suggestions.extend([make_suggestion(name, 'variable') for name in variables])

suggestions.extend([make_suggestion(name, 'class', Pulsardo) for name in Pulsardo.Code.classes(Pulsardo)])
suggestions.extend([make_suggestion(name, 'class', Pulsardo.Patterns.Generators) for name in Pulsardo.Code.classes(Pulsardo.Patterns.Generators)])
suggestions.extend([make_suggestion(name, 'class', Pulsardo.Patterns.Main) for name in Pulsardo.Code.classes(Pulsardo.Patterns.Main)])
suggestions.extend([make_suggestion(name, 'function', Pulsardo.Patterns.Sequences) for name in Pulsardo.Code.functions(Pulsardo.Patterns.Sequences)])
suggestions.extend([make_suggestion(name, 'method') for name in dir(Pulsardo.Player) if callable(getattr(Pulsardo.Player, name)) and name[0].islower()])
suggestions.extend([make_suggestion(name, 'property') for name in Pulsardo.Player.Attributes()])

suggestions.extend([make_suggestion(name, 'function', Pulsardo) for name in Pulsardo.SynthDefs if name != 'play1' and name != 'play2'])
suggestions.append(make_suggestion('play', 'function', Pulsardo))

suggestions.extend([make_suggestion('Scale.' + name, 'constant') for name in Pulsardo.Scale.names()])

suggestions = [dict(t) for t in set([tuple(d.items()) for d in suggestions])]
suggestions.sort(key=itemgetter('text'))

with open('data/autocomplete.json', 'w') as f:
	json.dump(suggestions, f, indent=2)
