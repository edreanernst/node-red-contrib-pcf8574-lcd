// The MIT License (MIT)

// Copyright (c) 2019 Edrean Ernst

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

module.exports = function(RED) {
    var LCD = require('./lcd_driver.js');

    function LCDI2C(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var addr = 0x0;
        switch (config.variant) {
            case "PCF8574":
                addr = 0x27;
                break;
            case "PCF8574AT":
                addr = 0x3F;
                break;
        }
        var lcd = new LCD(addr);
        if (typeof lcd !== 'undefined' && lcd) {
            if (lcd.isAlive()) {
                node.status({fill:"green", shape:"dot", text:"OK"});
            } else {
                node.status({fill:"red", shape:"dot", text:"Unreachable"});
                RED.log.error("The LCD is unreachable. Please check variant property or connection.");
            }
        }
        node.on('input', function(msg) {
            if (lcd.isAlive()) {
                node.status({fill:"green", shape:"dot", text:"OK"});
            } else {
                node.status({fill:"red", shape:"dot", text:"Unreachable"});
                RED.log.error("The LCD is unreachable. Please check variant property or connection.");
                return;
            }
            
            if (msg === undefined) {
                RED.log.error("No input msg defined!");
                node.status({fill:"red", shape:"dot", text:"No input msg defined!"});
                return;
            }

            //Default line if none specified
            // try {
            //     if ((msg.line === undefined) || (msg.line > 4) || (msg.line < 1)) {
            //         msg.line = 1;
            //     }
            // } catch(e) {
            //     msg.line = 1;
            // }

            // Action
            if (msg.action !== undefined) {
                switch (msg.action) {
                    case "clearscreen":
                        lcd.clear();
                        break;
                    case "clearline":
                        lcd.setCursor(0, msg.line-1);
                        lcd.print("                    ");
                        break;
                    case "off":
                        lcd.off();
                        break;
                    case "on":
                        lcd.on();
                        break;
                }
            }

            // Payload
            if (msg.payload !== undefined) {
                var x = 0;
                if (msg.alignment !== undefined) {
                    switch (msg.alignment) {
                        case "center":
                            var x = (20 - msg.payload.length) / 2;
                            break;
                        case "right":
                            var x = (20 - msg.payload.length);
                            break;
                    }
                }
                lcd.setCursor(x, msg.line-1);
                lcd.print(msg.payload);
            }
        });
    }
    RED.nodes.registerType("LCD-I2C", LCDI2C);
}