This node-red node is used to communicate with an HD44780 style LCD panel through the PCF8574 I2C interface.

Examples of this hardware setup can be found at the following URL's :
* [I2C backpack](https://tronixlabs.com.au/display/lcd/serial-i2c-backpack-for-hd44780-compatible-lcd-modules-australia/)
* [LCD and backpack](https://www.communica.co.za/products/bsk-20x4-i2c-serial-lcd)

## Table of Contents
- [Table of Contents](#Table-of-Contents)
- [Dependencies](#Dependencies)
- [Installation](#Installation)
- [Properties](#Properties)
- [Usage](#Usage)
  - [msg.line](#msgline)
  - [msg.action](#msgaction)
  - [msg.alignment](#msgalignment)
  - [msg.payload](#msgpayload)
- [Examples](#Examples)
  - [Clear the screen and display text on specific line](#Clear-the-screen-and-display-text-on-specific-line)
  - [Turn off the display](#Turn-off-the-display)
  - [Clear a specific line](#Clear-a-specific-line)

## Dependencies
This node depends on the following libraries :
* i2c-bus (http://)
* sleep (http://)

It is also necessary to make sure that I2C is enabled on your Raspberry Pi. This can be done in raspi-config :
```
sudo raspi-config
    Interfacing Options > I2C > Enable
```

## Installation
This node can be installed through the Palette Manager in node-red.

It can also be installed by running the following command in your node-red directory (usually ~/.node-red) :
```
npm install node-red-contrib-pcf8574-lcd
```

## Properties
The node has the following properties :
* Variant
  * PCF8574 or PCF8574AT. The default value is PCF8574. Care should be taken to correctly identify the I2C chip on your device. The different variants do not have the same I2C addresses and it will not work if the incorrect variant is chosen.
* Size
  * Only 20x4 is supported at this time. Support for other display sizes can be considered on request.
* Name
  * The chosen name for the node.

## Usage
This node will accept the following fields as input (all fields are optional):

### msg.line
This is a numeric field that indicates the line number on the display that relevant actions will be taken on as well as where text specified in [msg.payload](#msgpayload) will be displayed.

Accepted values are 1-4 on the 20x4 LCD's. If no value is specified, line 1 will be assumed.

### msg.action
This is a string field where an action can be specified that should be performed prior to anything being written to the display.

Accepted action strings are :
* 'clearscreen' - This will clear the whole LCD display
* 'clearline' - This will clear only the line specified by msg.line (or the first line if not specified)
* 'on' - Turn the display on
* 'off' - Turn the display off

### msg.alignment
This is a string field where the text alignment can be specified of the text specified in the [msg.payload](#msgpayload) field.

Accepted alignment strings are :
* 'center' - This will align the text to the center of the line
* 'right' - This will align the text to the right of the line

If no value is specified, the text will be left aligned.

### msg.payload
This is a string field where text can be specified that should be displayed.

## Examples

### Clear the screen and display text on specific line
```
"msg": {
    "action": "clearscreen",
    "line": 2,
    "payload": "Hello World!"
}
```

### Turn off the display
```
"msg": {
    "action": "off"
}
```

### Clear a specific line
```
"msg": {
    "action": "clearline",
    "line": 3
}
```