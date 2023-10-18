const fs = require('fs');
const EventEmitter = require('events');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @class _KeyboardListener
 * */
class _KeyboardListener extends EventEmitter {
	static Constants = {
		Event: require(`${__dirname}/constant/events.constant.js`),
		Key: require(`${__dirname}/constant/keys.constant.js`),
		Character: require(`${__dirname}/constant/characters.constant.js`),
	};

	constructor(options){
		super();

		const self = this;
		if(options) self.init(options);
	}

	/**
	 * Check system architecture is 64-bit or 32-bit.
	 * Byte size for 'long' is different between 64 and 32 bit.
	 * It's used to determine input event struct size which has timespec variable.
	 * The struct for input event is shown below
	 *
	 * struct input_event {
	 * 	struct timeval time;
	 * 	__u16 type;
	 * 	__u16 code;
	 * 	__s32 value;
	 * };
	 *
	 * @private
	 * */
	_detectSytem(){
		const self = this;

		const is64bit = process.arch.includes('64');
		self._SysInfo = {
			is64bit,
			size: {
				struct: is64bit ? 24 : 16,
				long: is64bit ? 8 : 4,
				timespec: is64bit ? 16 : 8,
			},
		};
	}

	/**
	 * Initialize class properies
	 * @params {Object} options - configuration
	 * @params {string} options.path - Path to selected input event device
	 * @params {number} [options.interval=1000] - interval between attempt to check dev path is accessible, in ms
	 * @params {Object} [options.readline] - if defined, then will activated parse by line
	 * */
	init(options = {}){
		const self = this;

		self._detectSytem();

		self.setPath(options.path);
		self.setInterval(options.interval);

		if(options.readline) self.readline(options.readline);

		return self;
	}

	/**
	 * Parse incoming data into delimited string
	 * @params {string} [options.delimiter='\n'] - delimiter character
	 * @params {string} [options.on='keydown'] - read character on 'keydown' or 'keyup'
	 * @params {number} [options.debounce=100] - delay in ms between line to avoid double line reading
	 * */
	readline(options = {}){
		const self = this;

		const { delimiter, on, debounce } = options;

		self._line = {
			delimiter: delimiter || '\n',
			debounce: debounce || 100,
			on: on || 'keydown',
			message: '',
			shiftPressed: false,
			timer: {
				last: Date.now(),
				get diff(){
					return Date.now() - this.last;
				},
			}
		};

		return self;
	}

	/**
	 * set ms interval between attempt to open path
	 * @params {number} [ms=1000] - interval in milliseconds
	 * */
	setInterval(ms = 1000){
		const self = this;

		self._interval = ms;
		return self;
	}

	/**
	 * set dev input path to listen
	 * @params {string} devpath - path to dev input
	 * */
	setPath(devpath){
		const self = this;

		self._path = devpath;
		return self;
	}

	/**
	 * restart listener, if devpath is defined, then open new stream with that path
	 * @params {string} [devpath] - new devpath if needed
	 * */
	 async restart(devpath){
		const self = this;

		await self.close();
		if(typeof(devpath) === 'string') self.setPath(devpath);

		return self.open();
	 }

	/**
	 * Stop listener and remove handlers
	 * */
	async close(){
		const self = this;

		if(!self.isOpen) return self;

		self._forceClose = true;
		self.isOpen = false;

		// readStream is auto closed when file handle is closed
		self._fd.close();

		return self;
	}

	/**
	 * Start listener
	 * */
	async open(){
		const self = this;

		self.isOpen = false;
		self._forceClose = false;

		// wait until dev path exist
		while(!self.isOpen){
			self.isOpen = await fs.promises.stat(self._path)
				.then(error => true)
				.catch(error => false);

			// no need to sleep if path is accessible
			if(!self.isOpen) await sleep(self._interval);
		}

		self._fd = (await fs.promises.open(self._path, 'r'))
			.on('close', () => {
					console.log('closing');
					self.emit('close', self._path);
					delete self._stream;

					// reopen the read stream, if not forced
					if(!self._forceClose) self.open();
				});

		self._stream = self._fd.createReadStream({ encoding: null })
			.on('data', buffer => self._parseBuffer(buffer))
			.on('error', error => self.emit('error', error));

		self.emit('open', self._path)

		return self;
	}

	/**
	 * Parse incoming buffer.
	 * Received bytes might contains more than just one input event.
	 * each parsed event will be passed to _parseInput.
	 * @private
	 * @params {Buffer} buffer - received bytes
	 * */
	_parseBuffer(buffer){
		const self = this;

		const { length } = buffer;
		const { is64bit, size } = self._SysInfo;

		for(let offset = 0; offset < length; offset += size.struct){
			self._parseInput({
					timespec: {
						tv_sec: is64bit
							? buffer.readBigInt64LE(offset)
							: buffer.readInt32LE(offset),
						tv_usec: is64bit
							? buffer.readBigInt64LE(offset + size.long)
							: buffer.readInt32LE(offset + size.long)
					},
					type: buffer.readUInt16LE(offset + size.timespec),
					code: buffer.readUInt16LE(offset + size.timespec + 2),
					value: buffer.readInt32LE(offset + size.timespec + 4),
				});
		}
	}

	/**
	 * Parse an input event.
	 * If readline is active, then on every 'EV_KEY' event will be passed to _parseLine.
	 * @private
	 * @fires _KeyboardListener#data
	 * @params {Object} data - input event struct as an object
	 * */
	_parseInput(data){
		const self = this;

		const { Event, Key } = _KeyboardListener.Constants;

		const res = {
			type: Event[data.type],
			code: Event[data.type] === 'EV_MSC' ? data.code : Key[data.code],
			value: data.value,
		};

		/**
		 * Input event
		 * @event _KeyboardListener#data
		 * @type {Object}
		 * @property {string} type - input event type
		 * @property {string|number} code - input event code
		 * @property {number} value - input event value
		 * */
		self.emit('data', res);

		if(self._line && res.type === 'EV_KEY') self._parseLine(res);
	}

	/**
	 * Parse an keypress input event into corresponding keyboard key's character.
	 * Emit event if delimiter character is found.
	 * @private
	 * @fires _KeyboardListener#readline
	 * @params {Object} data - parsed input event
	 * */
	_parseLine(data){
		const self = this;

		const { delimiter, on } = self._line;
		const { code, value } = data;

		const {
				Chars,
				ShiftedChars,
				ShiftKeys
			} = _KeyboardListener.Constants.Character;

		if(!self._line.shiftPressed && ShiftKeys[code]){
			self._line.shiftPressed = true;
			return;
		}

		const isFired = (on === 'keyup' && !value)
			|| (on !== 'keyup' && (value | (value >> 1)));

		if(!isFired) return;

		const char = self._line.shiftPressed && ShiftedChars[code]
			? ShiftedChars[code]
			: Chars[code];

		self._line.shiftPressed = false;

		if(!char) return;

		if(char === delimiter) {
			if(self._line.timer.diff > self._line.debounce){

				/**
				 * Readline event
				 * @event _KeyboardListener#readline
				 * @param {string} - delimited string
				 * */
				self.emit('readline', self._line.message);
			}

			self._line.message = '';
			self._line.timer.last = Date.now();

			return;
		}

		self._line.message += char;
	}
}

module.exports = _KeyboardListener;
