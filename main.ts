/**
 * Blocks to control an OLED display from a Calliope mini.
 * The functions should work with the display controllers SSD1306/SSD1315 
 *
 **/

// Thanks to Banbury for the main code
// https://github.com/Banbury/pxt-calliope-oled96
// MIT License Copyright (c) 2018 Banbury
// Thanks to SuperEugen for the extendedCharacters
// https://github.com/SuperEugen/pxt-calliope-grove-ssd1327
// MIT License Copyright (c) 2018 Ingo Hoffmann
// Thanks to Michael Klein for the German version
// https://github.com/MKleinSB/pxt-OLED-SSD1306
// MIT License Copyright (c) 2019 Michael Klein
//
// Changes by Ralf Krause 20240805
// Changed initDisplay and writeChar
// Added new flipDirection and setBrightness 
// Added new language settings (en, de)
// https://github.com/ralf-krause/display-oled-16x8
// MIT License Copyright (c) 2024 Ralf Krause

enum OnOff {
    //% block="on"
    On,
    //% block="off"
    Off
}

enum NormalInvert {
    //% block="white on black"
    Normal,
    //% block="black on white"
    Invert
}

enum UpDown {
    //% block="up"
    Up,
    //% block="down"
    Down
}


// color=#62449e
// color=#8731b3
// color=#9f4ec9

//% color=#9f4ec9 icon="\uf108" block="OLED 16x8" weight=20
namespace oled_16x8 {

    /**
     * Reset and clear the display.
     * Should be used at the start of the program.
     */
    //% blockId=oled_16x8_init_display 
    //% group="first block using the display" blockgap=4 weight=100
    //% block="initialize display"
    export function initDisplay(): void {
        // init display codes from Adafruit
        // http://www.adafruit.com/datasheets/UG-2864HSWEG01.pdf Chapter 4.4
        cmd(DISPLAY_OFF);

        cmd(SET_DISPLAY_CLOCK_DIV);
        cmd(0x80);  // OSC frequency 

        cmd(SET_MULTIPLEX);
        cmd(0x3F);  // multiplex ratio for 128x64 (64-1)

        cmd(SET_DISPLAY_OFFSET);
        cmd(0x00);  // display offset

        cmd(SET_START_LINE);

        cmd(CHARGE_PUMP);
        cmd(0x14);  // 0x10 external, 0x14 internal DC/DC

        cmd(SEG_REMAP);  // display direction up
        cmd(COM_SCAN_DEC);

        cmd(SET_COM_PINS);
        cmd(0x12);  // COM hardware configuration

        cmd(SET_CONTRAST);
        cmd(0xC8);  // contrast 200

        cmd(SET_PRECHARGE);
        cmd(0xF1);  // 0x22 external, 0xF1 internal

        cmd(SET_VCOM_DETECT);
        cmd(0x40);  // VCOMH deselect level

        cmd(DISPLAY_ALL_ON_RESUME);  // set all pixels off
        cmd(NORMAL_DISPLAY);  // normal display is white on black
        cmd(DISPLAY_ON);

        clearDisplay();
    }

    /**
     * Clear the whole display.
     */
    //% blockId=oled_16x8_clear_display 
    //% group="write text and numbers" blockgap=4 weight=40
    //% block="clear display"
    export function clearDisplay(): void {
        cmd(DISPLAY_OFF);   //display off
        for (let j = 0; j < 8; j++) {
            setCursor(j, 0);
            for (let i = 0; i < 16; i++) { //clear all columns
                writeChar(' ');
            }
        }
        setCursor(0, 0);
        cmd(DISPLAY_ON);    //display on
    }

    /**
     * Clear a range of characters starting at the cursor position.
     * @param n Number of characters to delete
     */
    //% blockId=oled_16x8_clear_range 
    //% group="write text and numbers" blockgap=4 weight=30
    //% block="clear %n characters"
    export function clearRange(n: number): void {
        for (let i = 0; i < n; i++) {
            writeChar(' ');
        }
    }

    /**
     * Move the cursor to a new position.
     */
    //% row.min=0 row.max=7 
    //% column.min=0 column.max=15
    //% blockId=oled_16x8_set_cursor 
    //% group="write text and numbers" blockgap=4 weight=50
    //% block="set cursor to|row %row|and column %column"
    export function setCursor(row: number, column: number): void {
        let r = row;
        let c = column;
        if (row < 0) { r = 0 }
        if (column < 0) { c = 0 }
        if (row > 7) { r = 7 }
        if (column > 15) { c = 15 }

        cmd(0xB0 + r);            //set page address
        cmd(0x00 + (8 * c & 0x0F));  //set column lower address
        cmd(0x10 + ((8 * c >> 4) & 0x0F));   //set column higher address
    }

    /**
     * Write a single character to the display.
     */
    function writeChar(c: string): void {
        let i = c.charCodeAt(0);
        if (32 <= i && i <= 127) {
            writeCustomChar(basicChar[i - 32]); // printable ASCII
        } else {
            switch (i) {
                //use this for multilingual characters
                case 196: writeCustomChar(extendedChar[0]); break; //Ä
                case 214: writeCustomChar(extendedChar[1]); break; //Ö
                case 220: writeCustomChar(extendedChar[2]); break; //Ü
                case 228: writeCustomChar(extendedChar[3]); break; //ä
                case 246: writeCustomChar(extendedChar[4]); break; //ö
                case 252: writeCustomChar(extendedChar[5]); break; //ü
                case 223: writeCustomChar(extendedChar[6]); break; //ß
                case 172: writeCustomChar(extendedChar[7]); break; //€
                case 176: writeCustomChar(extendedChar[8]); break; //°
                default:  writeCustomChar(extendedChar[9]); // other
            }
        }
    }

    /**
     * Write a string to the display starting at the cursor position.
     */
    //% blockId=oled_16x8_write_string  
    //% group="write text and numbers" blockgap=4 weight=90
    //% block="write text %s to the display"
    export function writeString(s: string): void {
        for (let c of s) {
            writeChar(c);
        }
    }

    /**
     * Write a number to the display at the current cursor position.
     */
    //% blockId=oled_16x8_write_number  
    //% group="write text and numbers" blockgap=4 weight=80
    //% block="write number %n to the display"
    export function writeNumber(n: number): void {
        writeString("" + n)
    }

    /**
     * Turn the display on and off.
     */
    //% blockId=oled_16x8_turn_onoff 
    //% group="display settings" advanced=true weight=90
    //% @param mode 
    //% block="turn display %mode"
    export function turnOnOffDisplay(mode: OnOff): void {
        if (mode == OnOff.On) {
            cmd(DISPLAY_ON);
        } else {
            cmd(DISPLAY_OFF);
        }
    }

    //% blockId=oled_16x8_set_displaymode 
    //% group="display settings" advanced=true weight=80
    //% @param mode 
    //% block="set mode to %mode"
    export function setDisplaymode(mode: NormalInvert): void {
        cmd(DISPLAY_OFF);
        basic.pause(100);
        if (mode == NormalInvert.Normal) {
            cmd(NORMAL_DISPLAY);
        } else {
            cmd(INVERT_DISPLAY);
        }
        basic.pause(100);
        cmd(DISPLAY_ON);
    }

    /**
     * Flip the display direction upside down.
     */
    //% blockId=oled_16x8_flip_direction 
    //% group="display settings" advanced=true weight=70
    //% @param mode 
    //% block="flip direction %mode"
    export function flipDirection(mode: UpDown): void {
        cmd(DISPLAY_OFF);
        basic.pause(100);
        if (mode == UpDown.Up) {
            cmd(COM_SCAN_DEC);
            cmd(0xA1);  //Set Segment Re-Map
        } else {
            cmd(COM_SCAN_INC);
            cmd(0xA0);  //Set Segment Re-Map
        }
        basic.pause(100);
        cmd(DISPLAY_ON);    
    }

    /**
     * Set the brightness of the display. 
     * @param brightness Values range from 0 to 255, eg: 200
     */
    //% blockId=oled96_set_brightness 
    //% group="display settings" advanced=true blockgap=8 weight=60
    //% brightness.min=0 brightness.max=255
    //% block="set brightness to %brightness"
    export function setBrightness(brightness: number): void {
        let b = brightness
        if (b < 0) { b = 0; }
        if (b > 255) { b = 255; }
        cmd(SET_CONTRAST);
        cmd(b);
    }

    /**
     * Write a custom character to the display at the cursor position.
     * A character is a string of 8 bytes. 
     * Each byte represents a line of the character. 
     * The bits of each byte represent the pixels of a line of the character.
     * Ex. "\x00\xFF\x81\x81\x81\xFF\x00\x00"
     * Only use in Javascript mode! Makecode adds extra backslashes in Block mode.
     */
    //% blockId=oled_16x8_write_custom_char 
    //% group="advanced commands" advanced=true weight=10
    //% block="write custom char %c"
    export function writeCustomChar(c: string) {
        for (let i = 0; i < 8; i++) {
            writeData(c.charCodeAt(i));
        }
    }

    /**
     * Send a command to the display.
     * Only use this if you know what you are doing.
     * 
     * For valid commands refer to the SSD1308/SSD1315 documentation
     * The i2c address of the display is 0x3c and unfortunately hard-coded
     */
    //% blockId=oled_16x8_send_command
    //% group="advanced commands" advanced=true weight=30
    //% block="send command %c to display"
    export function cmd(c: number): void {
        pins.i2cWriteNumber(0x3c, c, NumberFormat.UInt16BE);
    }

    /**
     * Write a byte to the display.
     * Could be used to directly paint to the display.
     */
    //% blockId=oled_16x8_write_data
    //% group="advanced commands" advanced=true weight=20
    //% block="send byte %n to display"
    export function writeData(n: number): void {
        let b = n;
        if (n < 0) { n = 0 }
        if (n > 255) { n = 255 }

        pins.i2cWriteNumber(0x3c, 0x4000 + b, NumberFormat.UInt16BE);
    }

    const DISPLAY_OFF = 0xAE;
    const DISPLAY_ON = 0xAF;
    const SET_DISPLAY_CLOCK_DIV = 0xD5;
    const SET_MULTIPLEX = 0xA8;
    const SET_DISPLAY_OFFSET = 0xD3;
    const SET_START_LINE = 0x00;
    const CHARGE_PUMP = 0x8D;
    const EXTERNAL_VCC = false;
    const MEMORY_MODE = 0x20;
    const SEG_REMAP = 0xA1; // use 0xA0 when flip screen
    const COM_SCAN_DEC = 0xC8;
    const COM_SCAN_INC = 0xC0;
    const SET_COM_PINS = 0xDA;
    const SET_CONTRAST = 0x81;
    const SET_PRECHARGE = 0xd9;
    const SET_VCOM_DETECT = 0xDB;
    const DISPLAY_ALL_ON_RESUME = 0xA4;
    const NORMAL_DISPLAY = 0xA6;
    const COLUMN_ADDR = 0x21;
    const PAGE_ADDR = 0x22;
    const INVERT_DISPLAY = 0xA7;
    const ACTIVATE_SCROLL = 0x2F;
    const DEACTIVATE_SCROLL = 0x2E;
    const SET_VERTICAL_SCROLL_AREA = 0xA3;
    const RIGHT_HORIZONTAL_SCROLL = 0x26;
    const LEFT_HORIZONTAL_SCROLL = 0x27;
    const VERTICAL_AND_RIGHT_HORIZONTAL_SCROLL = 0x29;
    const VERTICAL_AND_LEFT_HORIZONTAL_SCROLL = 0x2A;

    const basicChar: string[] = [
        "\x00\x00\x00\x00\x00\x00\x00\x00", // " "
        "\x00\x00\x5F\x00\x00\x00\x00\x00", // "!"
        "\x00\x00\x07\x00\x07\x00\x00\x00", // """
        "\x00\x14\x7F\x14\x7F\x14\x00\x00", // "#"
        "\x00\x24\x2A\x7F\x2A\x12\x00\x00", // "$"
        "\x00\x23\x13\x08\x64\x62\x00\x00", // "%"
        "\x00\x36\x49\x55\x22\x50\x00\x00", // "&"
        "\x00\x00\x05\x03\x00\x00\x00\x00", // "'"
        "\x00\x1C\x22\x41\x00\x00\x00\x00", // "("
        "\x00\x41\x22\x1C\x00\x00\x00\x00", // ")"
        "\x00\x08\x2A\x1C\x2A\x08\x00\x00", // "*"
        "\x00\x08\x08\x3E\x08\x08\x00\x00", // "+"
        "\x00\xA0\x60\x00\x00\x00\x00\x00", // ","
        "\x00\x08\x08\x08\x08\x08\x00\x00", // "-"
        "\x00\x60\x60\x00\x00\x00\x00\x00", // "."
        "\x00\x20\x10\x08\x04\x02\x00\x00", // "/"
        "\x00\x3E\x51\x49\x45\x3E\x00\x00", // "0"
        "\x00\x00\x42\x7F\x40\x00\x00\x00", // "1"
        "\x00\x62\x51\x49\x49\x46\x00\x00", // "2"
        "\x00\x22\x41\x49\x49\x36\x00\x00", // "3"
        "\x00\x18\x14\x12\x7F\x10\x00\x00", // "4"
        "\x00\x27\x45\x45\x45\x39\x00\x00", // "5"
        "\x00\x3C\x4A\x49\x49\x30\x00\x00", // "6"
        "\x00\x01\x71\x09\x05\x03\x00\x00", // "7"
        "\x00\x36\x49\x49\x49\x36\x00\x00", // "8"
        "\x00\x06\x49\x49\x29\x1E\x00\x00", // "9"
        "\x00\x00\x36\x36\x00\x00\x00\x00", // ":"
        "\x00\x00\xAC\x6C\x00\x00\x00\x00", // ";"
        "\x00\x08\x14\x22\x41\x00\x00\x00", // "<"
        "\x00\x14\x14\x14\x14\x14\x00\x00", // "="
        "\x00\x41\x22\x14\x08\x00\x00\x00", // ">"
        "\x00\x02\x01\x51\x09\x06\x00\x00", // "?"
        "\x00\x32\x49\x79\x41\x3E\x00\x00", // "@"
        "\x00\x7E\x09\x09\x09\x7E\x00\x00", // "A"
        "\x00\x7F\x49\x49\x49\x36\x00\x00", // "B"
        "\x00\x3E\x41\x41\x41\x22\x00\x00", // "C"
        "\x00\x7F\x41\x41\x22\x1C\x00\x00", // "D"
        "\x00\x7F\x49\x49\x49\x41\x00\x00", // "E"
        "\x00\x7F\x09\x09\x09\x01\x00\x00", // "F"
        "\x00\x3E\x41\x41\x51\x72\x00\x00", // "G"
        "\x00\x7F\x08\x08\x08\x7F\x00\x00", // "H"
        "\x00\x41\x7F\x41\x00\x00\x00\x00", // "I"
        "\x00\x20\x40\x41\x3F\x01\x00\x00", // "J"
        "\x00\x7F\x08\x14\x22\x41\x00\x00", // "K"
        "\x00\x7F\x40\x40\x40\x40\x00\x00", // "L"
        "\x00\x7F\x02\x0C\x02\x7F\x00\x00", // "M"
        "\x00\x7F\x04\x08\x10\x7F\x00\x00", // "N"
        "\x00\x3E\x41\x41\x41\x3E\x00\x00", // "O"
        "\x00\x7F\x09\x09\x09\x06\x00\x00", // "P"
        "\x00\x3E\x41\x51\x21\x5E\x00\x00", // "Q"
        "\x00\x7F\x09\x19\x29\x46\x00\x00", // "R"
        "\x00\x26\x49\x49\x49\x32\x00\x00", // "S"
        "\x00\x01\x01\x7F\x01\x01\x00\x00", // "T"
        "\x00\x3F\x40\x40\x40\x3F\x00\x00", // "U"
        "\x00\x1F\x20\x40\x20\x1F\x00\x00", // "V"
        "\x00\x3F\x40\x38\x40\x3F\x00\x00", // "W"
        "\x00\x63\x14\x08\x14\x63\x00\x00", // "X"
        "\x00\x03\x04\x78\x04\x03\x00\x00", // "Y"
        "\x00\x61\x51\x49\x45\x43\x00\x00", // "Z"
        "\x00\x7F\x41\x41\x00\x00\x00\x00", // """
        "\x00\x02\x04\x08\x10\x20\x00\x00", // "\"
        "\x00\x41\x41\x7F\x00\x00\x00\x00", // """
        "\x00\x04\x02\x01\x02\x04\x00\x00", // "^"
        "\x00\x80\x80\x80\x80\x80\x00\x00", // "_"
        "\x00\x01\x02\x04\x00\x00\x00\x00", // "`"
        "\x00\x20\x54\x54\x54\x78\x00\x00", // "a"
        "\x00\x7F\x48\x44\x44\x38\x00\x00", // "b"
        "\x00\x38\x44\x44\x28\x00\x00\x00", // "c"
        "\x00\x38\x44\x44\x48\x7F\x00\x00", // "d"
        "\x00\x38\x54\x54\x54\x18\x00\x00", // "e"
        "\x00\x08\x7E\x09\x02\x00\x00\x00", // "f"
        "\x00\x18\xA4\xA4\xA4\x7C\x00\x00", // "g"
        "\x00\x7F\x08\x04\x04\x78\x00\x00", // "h"
        "\x00\x00\x7D\x00\x00\x00\x00\x00", // "i"
        "\x00\x80\x84\x7D\x00\x00\x00\x00", // "j"
        "\x00\x7F\x10\x28\x44\x00\x00\x00", // "k"
        "\x00\x41\x7F\x40\x00\x00\x00\x00", // "l"
        "\x00\x7C\x04\x18\x04\x78\x00\x00", // "m"
        "\x00\x7C\x08\x04\x7C\x00\x00\x00", // "n"
        "\x00\x38\x44\x44\x38\x00\x00\x00", // "o"
        "\x00\xFC\x24\x24\x18\x00\x00\x00", // "p"
        "\x00\x18\x24\x24\xFC\x00\x00\x00", // "q"
        "\x00\x00\x7C\x08\x04\x00\x00\x00", // "r"
        "\x00\x48\x54\x54\x24\x00\x00\x00", // "s"
        "\x00\x04\x7F\x44\x00\x00\x00\x00", // "t"
        "\x00\x3C\x40\x40\x7C\x00\x00\x00", // "u"
        "\x00\x1C\x20\x40\x20\x1C\x00\x00", // "v"
        "\x00\x3C\x40\x30\x40\x3C\x00\x00", // "w"
        "\x00\x44\x28\x10\x28\x44\x00\x00", // "x"
        "\x00\x1C\xA0\xA0\x7C\x00\x00\x00", // "y"
        "\x00\x44\x64\x54\x4C\x44\x00\x00", // "z"
        "\x00\x08\x36\x41\x00\x00\x00\x00", // "{"
        "\x00\x00\x7F\x00\x00\x00\x00\x00", // "|"
        "\x00\x41\x36\x08\x00\x00\x00\x00", // "}"
        "\x00\x02\x01\x01\x02\x01\x00\x00"  // "~"
    ];
    const extendedChar: string[] = [
        "\x00\x7D\x0A\x09\x0A\x7D\x00\x00", // "Ä"
        "\x00\x3D\x42\x41\x42\x3D\x00\x00", // "Ö"
        "\x00\x3D\x40\x40\x40\x3D\x00\x00", // "Ü"
        "\x00\x21\x54\x54\x55\x78\x00\x00", // "ä"
        "\x00\x39\x44\x44\x39\x00\x00\x00", // "ö"
        "\x00\x3D\x40\x40\x7D\x00\x00\x00", // "ü"
        "\x00\xFE\x09\x49\x36\x00\x00\x00", // "ß"
        "\x00\x14\x3E\x55\x55\x55\x14\x00", // "€"
        "\x00\x02\x05\x02\x00\x00\x00\x00", // "°"
        "\x00\xFF\x81\x81\x81\xFF\x00\x00"  // other
    ];

} // end namespace oled_16x8

