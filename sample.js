const KeyboarListener = require('.');
const filepath = process.argv[2] || '/dev/input/event5';

const keyboard = new KeyboarListener();

keyboard.init({
			path: filepath,
			readline: {
				on: 'keydown',
				debounce: 1000,
			},
		})
	.on('data', rec => console.log(rec))
	.on('readline', rec => console.log('line:', rec))
	.on('error', error => console.error(error))
	.on('close', () => console.error('Close', filepath))
	.on('open', () => console.error('Open', filepath))
	.open();
