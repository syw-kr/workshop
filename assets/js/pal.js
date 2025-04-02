/** 
 * @file  A JavaScript for SYW(Seven Years War)'s PAL file
 * @author AnNoying
 * @version 1.0.0
 */

/**
 * PAL(Palette)
 * @class PAL
 */
class PAL {
    //#region Constants
    /**
     * Max Size
     * @static
     * @type {number}
     */
    static MAX_SIZE = 256;
    //#endregion
    
    //#region Member Variables
    /**
     * Colors
     * @type {object[]}
     */
    #m_Colors;
    //#endregion

    //#region Properties
    /**
     * Gets the value of the Color
     * @returns {object[]}
     */
    get Color() { return [...this.#m_Colors]; }

    /**
     * Sets the value of the Color
     * @type {object}
     */
    set Color(value) { this.#m_Colors = value; }
    //#endregion

    //#region Constructor
    /**
     * Constructor
     * @constructor
     */
    constructor() {
        this.#m_Colors = [];
    }
    //#endregion

    //#region Public Methods
    /**
     * Add the Color
     * @param {number} red Red
     * @param {number} green Green
     * @param {number} blue Blue
     */
    AddColor(red, green, blue) {
        if (this.#m_Colors.length < PAL.MAX_SIZE) {
            this.#m_Colors.push({
                Red: red & 0xFF,
                Green: green & 0xFF,
                Blue: blue & 0xFF
            });
        }
    }

    /**
     * Load the PAL file
     * @param {ArrayBuffer} arrayBuffer r
     * @returns {boolean}
     */
    Load(arrayBuffer) {
        if (arrayBuffer?.byteLength > 0) {
            // Data
            const data = new Uint8ClampedArray(arrayBuffer);
            let offset = 0;

            const scaleFactor = 255 / 63;
            for (let i = 0; i < PAL.MAX_SIZE; ++i) {
                const red = Math.ceil(data[i * 3] * scaleFactor);
                const green = Math.ceil(data[i * 3 + 1] * scaleFactor);
                const blue = Math.ceil(data[i * 3 + 2] * scaleFactor);

                this.AddColor(red, green, blue);
            }
            
            return true;
        }

        return false;
    }

    /**
     * Gets the Hex Code
     * @param {number} index Index
     * @returns {string}
     */
    GetHexCodeToString(index) {
        if (index >= 0 && index < 256) {
            const color = this.#m_Colors[index];
            return `#${color.Red.toString(16).padStart(2, '0')}${color.Green.toString(16).padStart(2, '0')}${color.Blue.toString(16).padStart(2, '0')}`;
        }

        return '';
    }

    /**
     * Convert to JSON
     * @returns {object}
     */
    ToJSON() {
        return {
            Color: [...this.#m_Colors]
        };
    }
    //#endregion
};