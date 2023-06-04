const Chars = {
	KEY_SPACE: ' ',
	KEY_DOT: '.',
	KEY_COMMA: ',',
	KEY_SLASH: '/',
	KEY_BACKSLASH: '\\',
	KEY_SEMICOLON: ';',
	KEY_APOSTROPHE: '\'',
	KEY_GRAVE: '`',
	KEY_KPENTER: '\n',
	KEY_ENTER: '\n',
	KEY_MINUS: '-',
	KEY_EQUAL: '=',
	KEY_TAB: '\t',
	KEY_LEFTBRACE: '[',
	KEY_RIGHTBRACE: ']',
	KEY_1: '1',
	KEY_2: '2',
	KEY_3: '3',
	KEY_4: '4',
	KEY_5: '5',
	KEY_6: '6',
	KEY_7: '7',
	KEY_8: '8',
	KEY_9: '9',
	KEY_0: '0',
	KEY_KP1: '1',
	KEY_KP2: '2',
	KEY_KP3: '3',
	KEY_KP4: '4',
	KEY_KP5: '5',
	KEY_KP6: '6',
	KEY_KP7: '7',
	KEY_KP8: '8',
	KEY_KP9: '9',
	KEY_KP0: '0',
	KEY_Q: 'q',
	KEY_W: 'w',
	KEY_E: 'e',
	KEY_R: 'r',
	KEY_T: 't',
	KEY_Y: 'y',
	KEY_U: 'u',
	KEY_I: 'i',
	KEY_O: 'o',
	KEY_P: 'p',
	KEY_A: 'a',
	KEY_S: 's',
	KEY_D: 'd',
	KEY_F: 'f',
	KEY_G: 'g',
	KEY_H: 'h',
	KEY_J: 'j',
	KEY_K: 'k',
	KEY_L: 'l',
	KEY_Z: 'z',
	KEY_X: 'x',
	KEY_C: 'c',
	KEY_V: 'v',
	KEY_B: 'b',
	KEY_N: 'n',
	KEY_M: 'm',
};

const ShiftedChars = {
	KEY_SPACE: ' ',
	KEY_DOT: '>',
	KEY_COMMA: '<',
	KEY_SLASH: '?',
	KEY_BACKSLASH: '|',
	KEY_SEMICOLON: ':',
	KEY_APOSTROPHE: '\"',
	KEY_GRAVE: '~',
	KEY_KPENTER: '\n',
	KEY_ENTER: '\n',
	KEY_MINUS: '_',
	KEY_EQUAL: '+',
	KEY_TAB: '\t',
	KEY_LEFTBRACE: '{',
	KEY_RIGHTBRACE: '}',
	KEY_1: '!',
	KEY_2: '@',
	KEY_3: '#',
	KEY_4: '$',
	KEY_5: '%',
	KEY_6: '^',
	KEY_7: '&',
	KEY_8: '*',
	KEY_9: '(',
	KEY_0: ')',
	KEY_Q: 'Q',
	KEY_W: 'W',
	KEY_E: 'E',
	KEY_R: 'R',
	KEY_T: 'T',
	KEY_Y: 'Y',
	KEY_U: 'U',
	KEY_I: 'I',
	KEY_O: 'O',
	KEY_P: 'P',
	KEY_A: 'A',
	KEY_S: 'S',
	KEY_D: 'D',
	KEY_F: 'F',
	KEY_G: 'G',
	KEY_H: 'H',
	KEY_J: 'J',
	KEY_K: 'K',
	KEY_L: 'L',
	KEY_Z: 'Z',
	KEY_X: 'X',
	KEY_C: 'C',
	KEY_V: 'V',
	KEY_B: 'B',
	KEY_N: 'N',
	KEY_M: 'M',
};

const ShiftKeys = {
	'KEY_LEFTSHIFT': 42,
	'KEY_RIGHTSHIFT': 54,
	42: 'KEY_LEFTSHIFT',
	54: 'KEY_RIGHTSHIFT',
};

module.exports = {
	Chars,
	ShiftedChars,
	ShiftKeys,
};
