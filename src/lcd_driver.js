// Credit: Adapted from https://github.com/wilberforce/lcd-pcf8574 by https://github.com/wilberforce

var sleep = require('sleep');

var displayPorts = {
	RS : 0x01,
	E : 0x04,
	D4 : 0x10,
	D5 : 0x20,
	D6 : 0x40,
	D7 : 0x80,

	CHR : 1,
	CMD : 0,

	backlight : 0x08,
	RW : 0x20 // not used
};

class LCD {
    constructor(address, bus) {
        this.i2c = require('i2c-bus').openSync(bus);
        this.addr = address;

        this.write4(0x30, displayPorts.CMD); //initialization
        this._sleep(200);
        this.write4(0x30, displayPorts.CMD); //initialization
        this._sleep(100);
        this.write4(0x30, displayPorts.CMD); //initialization
        this._sleep(100);
        this.write4(LCD.FUNCTIONSET | LCD._4BITMODE | LCD._2LINE | LCD._5x10DOTS, displayPorts.CMD); //4 bit - 2 line 5x7 matrix
        this._sleep(10);
        this.write(LCD.DISPLAYCONTROL | LCD.DISPLAYON, displayPorts.CMD); //turn cursor off 0x0E to enable cursor
        this._sleep(10);
        this.write(LCD.ENTRYMODESET | LCD.ENTRYLEFT, displayPorts.CMD); //shift cursor right
        this._sleep(10);
        this.write(LCD.CLEARDISPLAY, displayPorts.CMD); // LCD clear
        return this;
    }
    _sleep(milli) {
        sleep.usleep(milli * 1000);
    }
    write4(x, c) {
        var a = (x & 0xF0); // Use upper 4 bit nibble
        this.i2c.sendByteSync(this.addr, a | displayPorts.backlight | c);
        this.i2c.sendByteSync(this.addr, a | displayPorts.E | displayPorts.backlight | c);
        this.i2c.sendByteSync(this.addr, a | displayPorts.backlight | c);
        this._sleep(1);
    }
    write(x, c) {
        this.write4(x, c);
        this.write4(x << 4, c);
        this._sleep(1);
        return this;
    }
    clear() {
        return this.write(LCD.CLEARDISPLAY, displayPorts.CMD);
    }
    print(str) {
        if (typeof str == 'string') {
            for (var i = 0; i < str.length; i++) {
                var c = str[i].charCodeAt(0);
                this.write(c, displayPorts.CHR);
                this._sleep(1);
            }
        }
        return this;
    }
    /** flashing block for the current cursor */
    cursorFull() {
        return this.write(LCD.DISPLAYCONTROL | LCD.DISPLAYON | LCD.CURSORON | LCD.BLINKON, displayPorts.CMD);
    }
    /** small line under the current cursor */
    cursorUnder() {
        return this.write(LCD.DISPLAYCONTROL | LCD.DISPLAYON | LCD.CURSORON | LCD.BLINKOFF, displayPorts.CMD);
    }
    /** set cursor pos, top left = 0,0 */
    setCursor(x, y) {
        var l = [0x00, 0x40, 0x14, 0x54];
        return this.write(LCD.SETDDRAMADDR | (l[y] + x), displayPorts.CMD);
    }
    /** set cursor to 0,0 */
    home() {
        var l = [0x00, 0x40, 0x14, 0x54];
        return this.write(LCD.SETDDRAMADDR | 0x00, displayPorts.CMD);
    }
    /** Turn underline cursor off */
    blinkOff() {
        return this.write(LCD.DISPLAYCONTROL | LCD.DISPLAYON | LCD.CURSOROFF | LCD.BLINKOFF, displayPorts.CMD);
    }
    /** Turn underline cursor on */
    blinkOn() {
        return this.write(LCD.DISPLAYCONTROL | LCD.DISPLAYON | LCD.CURSORON | LCD.BLINKOFF, displayPorts.CMD);
    }
    /** Turn block cursor off */
    cursorOff() {
        return this.write(LCD.DISPLAYCONTROL | LCD.DISPLAYON | LCD.CURSOROFF | LCD.BLINKON, displayPorts.CMD);
    }
    /** Turn block cursor on */
    cursorOn() {
        return this.write(LCD.DISPLAYCONTROL | LCD.DISPLAYON | LCD.CURSORON | LCD.BLINKON, displayPorts.CMD);
    }
    /** setBacklight */
    setBacklight(val) {
        if (val > 0) {
            displayPorts.backlight = 0x08;
        }
        else {
            displayPorts.backlight = 0x00;
        }
        return this.write(LCD.DISPLAYCONTROL, displayPorts.CMD);
    }
    /** setContrast stub */
    setContrast(val) {
        return this.write(LCD.DISPLAYCONTROL, displayPorts.CMD);
    }
    /** Turn display off */
    off() {
        displayPorts.backlight = 0x00;
        return this.write(LCD.DISPLAYCONTROL | LCD.DISPLAYOFF, displayPorts.CMD);
    }
    /** Turn display on */
    on() {
        displayPorts.backlight = 0x08;
        return this.write(LCD.DISPLAYCONTROL | LCD.DISPLAYON, displayPorts.CMD);
    }
    /** set special character 0..7, data is an array(8) of bytes, and then return to home addr */
    createChar(ch, data) {
        this.write(LCD.SETCGRAMADDR | ((ch & 7) << 3), displayPorts.CMD);
        for (var i = 0; i < 8; i++)
            this.write(data[i], displayPorts.CHR);
        return this.write(LCD.SETDDRAMADDR, displayPorts.CMD);
    }
    isAlive() {
        var deviceArray = this.i2c.scanSync(this.addr);
        return (deviceArray.length > 0);
    }
}

// commands
LCD.CLEARDISPLAY = 0x01;
LCD.RETURNHOME = 0x02;
LCD.ENTRYMODESET = 0x04;
LCD.DISPLAYCONTROL = 0x08;
LCD.CURSORSHIFT = 0x10;
LCD.FUNCTIONSET = 0x20;
LCD.SETCGRAMADDR = 0x40;
LCD.SETDDRAMADDR = 0x80;

//# flags for display entry mode
LCD.ENTRYRIGHT = 0x00;
LCD.ENTRYLEFT = 0x02;
LCD.ENTRYSHIFTINCREMENT = 0x01;
LCD.ENTRYSHIFTDECREMENT = 0x00;

//# flags for display on/off control
LCD.DISPLAYON = 0x04;
LCD.DISPLAYOFF = 0x00;
LCD.CURSORON = 0x02;
LCD.CURSOROFF = 0x00;
LCD.BLINKON = 0x01;
LCD.BLINKOFF = 0x00;

//# flags for display/cursor shift
LCD.DISPLAYMOVE = 0x08;
LCD.CURSORMOVE = 0x00;
LCD.MOVERIGHT = 0x04;
LCD.MOVELEFT = 0x00;

//# flags for function set
LCD._8BITMODE = 0x10;
LCD._4BITMODE = 0x00;
LCD._2LINE = 0x08;
LCD._1LINE = 0x00;
LCD._5x10DOTS = 0x04;
LCD._5x8DOTS = 0x00;

module.exports = LCD;
