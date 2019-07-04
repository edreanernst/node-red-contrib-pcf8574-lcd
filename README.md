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
  - [msg.payload](#msgpayload)
  - [msg.action](#msgaction)
- [Examples](#Examples)
  - [Clear the screen and display text on line 2](#Clear-the-screen-and-display-text-on-line-2)
  - [Turn off the display](#Turn-off-the-display)
  - [Clear line 3](#Clear-line-3)

## Dependencies
This node depends on the following libraries :
* i2c-bus (https://www.npmjs.com/package/i2c-bus)
* sleep (https://www.npmjs.com/package/sleep)

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

### msg.payload
This field takes a JSON object which defines the details of how each line should be displayed on the LCD.
The JSON object is expected to be an array. Each element in the array represents a line on the display. In other words, the first element corresponds to the first line, and so on. Amount of elements in the array is determined by the type of display.

If an empty element is passed in the array, the corresponding line on the display will not be modified.

Each element in the array consists of the following parameters :
* "clear" (*optional*) - Set this to true if the line should be cleared before the text is displayed. If not specified, the line will not be cleared.
* "text" - Set this to the text string that should be displayed.
* "alignment" (*optional*) - This determines the alignment on the line of the text to be displayed. Valid options are "center" or "right". If not specified, text will be left aligned.

As an example, if you want to display a text string on line 1 that is center aligned and also clear the line first, and also display a text string on line 4 that is right aligned without clearing the line :
```
"payload": [
    {
        "clear": true,
        "text": "Line 1 Text",
        "alignment": "center"
    },
    {},
    {},
    {
        "clear": false,
        "text": "Line 4 Text",
        "alignment": "right"
    }
]
```
The <code>msg.payload</code> field is not required if the intent is only to perform an action specified by <code>msg.action</code>.

### msg.action
This is a string field where an action can be specified that should be performed prior to anything being written to the display.

Accepted action strings are :
* "clearscreen" - This will clear the whole LCD display
* "on" - Turn the display on
* "off" - Turn the display off

## Examples

### Clear the screen and display text on line 2
```
"msg": {
    "action": "clearscreen",
    "payload": [
        {},
        {
            "text": "Example text"
        }
    ]
}
```

### Turn off the display
```
"msg": {
    "action": "off"
}
```

### Clear line 3
```
"msg": {
    "payload": [
        {},
        {},
        {
            "clear": true
        }
    ]
}
```