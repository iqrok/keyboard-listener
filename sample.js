const fs = require('fs');
const filepath = process.argv[2] || '/dev/input/event5';
const KeyboarListener = require('.');

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
	.open();
