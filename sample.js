const KeyboarListener = require('.');

const filepaths = [
	'/dev/input/event11',
	'/dev/input/event9',
];

// list input devices
(async () => { console.log(await KeyboarListener.listDevice(/by-id/)) })();

const { ErrorCode } = KeyboarListener.Constants

const keyboard = new KeyboarListener();
let counter = 0;

keyboard.init({
			path: '/dev/input/event1000', // this path doesn't exist
			readline: { on: 'keydown', debounce: 500 },
		})
	.on('data', rec => console.log(rec))
	.on('readline', rec => console.log('line =>', rec))
	.on('error', error => {
			console.error(error);

			if(error.code === ErrorCode.MaxOpenAttempt) {
				keyboard.setPath(filepaths[counter++ % filepaths.length]);
			}
		})
	.on('close', devpath => console.log('Closed =>', devpath))
	.on('open', devpath => console.log('Opened =>', devpath));

keyboard.open();

const interval = 10000;
async function _loop(){
	console.log('loop', counter, Date.now());
	await keyboard.restart(filepaths[counter++ % filepaths.length]);
	setTimeout(_loop, interval);
}

setTimeout(() => _loop(), 10000);
