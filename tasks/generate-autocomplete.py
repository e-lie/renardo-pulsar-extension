import json
import Renardo
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

suggestions.extend([make_suggestion(name, 'constant', Renardo) for name in constants])
suggestions.extend([make_suggestion(name, 'function', Renardo) for name in functions])
suggestions.extend([make_suggestion(name, 'keyword') for name in keywords])
suggestions.extend([make_suggestion(name, 'variable') for name in variables])

suggestions.extend([make_suggestion(name, 'class', Renardo) for name in Renardo.Code.classes(Renardo)])
suggestions.extend([make_suggestion(name, 'class', Renardo.Patterns.Generators) for name in Renardo.Code.classes(Renardo.Patterns.Generators)])
suggestions.extend([make_suggestion(name, 'class', Renardo.Patterns.Main) for name in Renardo.Code.classes(Renardo.Patterns.Main)])
suggestions.extend([make_suggestion(name, 'function', Renardo.Patterns.Sequences) for name in Renardo.Code.functions(Renardo.Patterns.Sequences)])
suggestions.extend([make_suggestion(name, 'method') for name in dir(Renardo.Player) if callable(getattr(Renardo.Player, name)) and name[0].islower()])
suggestions.extend([make_suggestion(name, 'property') for name in Renardo.Player.Attributes()])

suggestions.extend([make_suggestion(name, 'function', Renardo) for name in Renardo.SynthDefs if name != 'play1' and name != 'play2'])
suggestions.append(make_suggestion('play', 'function', Renardo))

suggestions.extend([make_suggestion('Scale.' + name, 'constant') for name in Renardo.Scale.names()])

suggestions = [dict(t) for t in set([tuple(d.items()) for d in suggestions])]
suggestions.sort(key=itemgetter('text'))

with open('data/autocomplete.json', 'w') as f:
	json.dump(suggestions, f, indent=2)
