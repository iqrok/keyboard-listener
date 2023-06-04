const fs = require('fs');
const EventEmitter = require('events');

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

	_detectSytem(){
		const self = this;

		const is64bit = process.arch.includes('64');

		/**
		 * struct input_event {
		 * 	struct timeval time;
		 * 	__u16 type;
		 * 	__u16 code;
		 * 	__s32 value;
		 * };
		 * */
		self._SysInfo = {
			is64bit,
			size: {
				struct: is64bit ? 24 : 16,
				long: is64bit ? 8 : 4,
				timespec: is64bit ? 16 : 8,
			},
		};
	}

	init(options = {}){
		const self = this;

		self._detectSytem();
		self._path = options.path;
		if(options.readline) self.readline(options.readline);

		return self;
	}

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

	async open(){
		const self = this;

		self._stream = fs.createReadStream(self._path, {
				flags: 'r',
				encoding: null,
			})
			.on('data', buffer => self._parseBuffer(buffer))
			.on('error', error => {
				throw error;
			});

		return self;
	}

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

	_parseInput(data){
		const self = this;

		const { Event, Key } = _KeyboardListener.Constants;

		const res = {
			type: Event[data.type],
			code: Event[data.type] === 'EV_MSC' ? data.code : Key[data.code],
			value: data.value,
		};

		self.emit('data', res);

		if(self._line && res.type === 'EV_KEY') self._parseLine(res);
	}

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