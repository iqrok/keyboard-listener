# Keyboard Listener

Listen to keyboard evdev event.
For more complete evdev listener, please check this library [evdev](https://github.com/sdumetz/node-evdev).

The intended use of this package is to listen to any keyboard-like device, such as RFID Reader or Barcode scanner.

This package needs the path to device input event, so it probably works only in **Linux**. Make sure you have read access to the input event path.

# Usage

To list available input event

```bash
$ ls /dev/input
total 0
drwxr-xr-x  4 root root     580 Jun  6 20:48 .
drwxr-xr-x 22 root root    4500 Jun  6 22:21 ..
drwxr-xr-x  2 root root     120 Jun  6 20:48 by-id
drwxr-xr-x  2 root root     260 Jun  6 20:48 by-path
crw-rw----  1 root input 13, 64 Jun  2 22:45 event9
crw-rw----  1 root input 13, 65 Jun  2 22:45 event11
crw-rw----  1 root input 13, 74 Jun  2 22:45 event18

# or

$ ls /dev/input/by-id/ -la
total 0
drwxr-xr-x 2 root root 120 Jun  6 20:48 .
drwxr-xr-x 4 root root 580 Jun  6 20:48 ..
lrwxrwxrwx 1 root root  10 Jun  2 22:45 usb-Generic_Integrated_Camera_200901010001-event-if00 -> ../event11
lrwxrwxrwx 1 root root   9 Jun  2 22:45 usb-Logitech_USB_Optical_Mouse-event-mouse -> ../event9
lrwxrwxrwx 1 root root   9 Jun  2 22:45 usb-Logitech_USB_Optical_Mouse-mouse -> ../mouse4
lrwxrwxrwx 1 root root  10 Jun  6 20:48 usb-USB_Adapter_USB_Device-event-kbd -> ../event18
```

```javascript
const KeyboarListener = require('@iqrok/keyboard-listener');
const eventpath = '/dev/input/by-id/usb-USB_Adapter_USB_Device-event-kbd';

const keyboard = new KeyboarListener();

keyboard.init({
			path: eventpath,
			readline: {
				on: 'keydown',
				debounce: 1000,
			},
		})
	.on('data', rec => console.log(rec))
	.on('readline', rec => console.log('line:', rec))
	.open();
```

# References

1. https://www.kernel.org/doc/Documentation/input/event-codes.txt
2. https://github.com/torvalds/linux/blob/master/include/uapi/linux/input-event-codes.h
