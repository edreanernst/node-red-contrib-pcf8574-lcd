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
        var addr = parseInt(config.address, 16); // convert from hexadecimal to decimal
        var bus = Number(config.bus);
        var numLines = 4;
        var numCols = 20;
        switch (config.size) {
            case "20x4":
                numLines = 4;
                numCols = 20;
                break;
            case "16x2":
                numLines = 2;
                numCols = 16;
                break;
        }

        var lcd = new LCD(addr, bus);
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
            
            //Input validation
            if (msg === undefined) {
                RED.log.error("No input msg defined!");
                node.status({fill:"red", shape:"dot", text:"No input msg defined!"});
                return;
            }

            // Action
            if (msg.action !== undefined) {
                switch (msg.action) {
                    case "clearscreen":
                        lcd.clear();
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
            if ((msg.payload !== undefined) && (Array.isArray(msg.payload))) {
                for (var row=0; row < numLines; row++) {
                    if (msg.payload[row] !== undefined) {
                        // Clear line if requested
                        try {
                            if (msg.payload[row].clear !== undefined) {
                                if (msg.payload[row].clear) {
                                    lcd.setCursor(0, row);
                                    var aStr = "".padStart(numCols, " ");
                                    lcd.print(aStr);
                                }
                            }    
                        } catch (error) {
                            RED.log.error("msg.payload[" + row.toString() + "].clear is not defined correctly: " + error);
                        }

                        try {
                            if (msg.payload[row].text !== undefined) {
                                if (msg.payload[row].text !== "") {
                                    var x = 0;
                                    if (msg.payload[row].alignment !== undefined) {
                                        switch (msg.payload[row].alignment) {
                                            case "center":
                                                x = (numCols - msg.payload[row].text.length) / 2;
                                                break;
                                            case "right":
                                                x = (numCols - msg.payload[row].text.length);
                                                break;
                                        }
                                    }
                                    lcd.setCursor(x, row);
                                    lcd.print(msg.payload[row].text);
                                }
                            }
                        } catch (error) {
                            RED.log.error("Error with msg.payload[" + row.toString() + "]: " + error);
                        }
                    }
                }   
            }
        });
    }
    RED.nodes.registerType("LCD-I2C", LCDI2C);
}