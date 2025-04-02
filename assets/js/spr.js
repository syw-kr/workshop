/** 
 * @file A JavaScript class for SYW(Seven Years War)'s SPR file
 * @author AnNoying
 * @version 1.0.0
 */

/**
 * SPR(Sprite)
 * @class
 */
class SPR {
    //#region Constants
    /**
     * Size of dummy1 array
     * @static
     * @readonly
     * @type {number}
     */
    static get MAX_DUMMY1_SIZE() { return 1200; }
    
    /**
     * Size of dummy2 array
     * @static
     * @readonly
     * @type {number}
     */
    static get MAX_DUMMY2_SIZE() { return 32; }
    
    /**
     * Size of offset array
     * @static
     * @readonly
     * @type {number}
     */
    static get MAX_OFFSET_SIZE() { return 300; }

    
    /**
     * Size of compressed size array
     * @static
     * @readonly
     * @type {number}
     */
    static get MAX_COMPRESSED_SIZE() { return 300; }
    //#endregion

    //#region Member Variables
    /**
     * Signature
     * @type {number}
     */
    #m_Signature;
    
    /**
     * Frame Width
     * @type {number}
     */
    #m_FrameWidth;
    
    /**
     * Frame Height
     * @type {number}
     */
    #m_FrameHeight;
    
    /**
     * Number of Frames
     * @type {number}
     */
    #m_NumberOfFrames;
    
    /**
     * Dummy 1
     * @type {Uint8Array}
     */
    #m_Dummy1;
    
    /**
     * Offset Array
     * @type {Uint32Array}
     */
    #m_Offsets;

    /**
     * Compressed Size Array
     * @type {Uint16Array}
     */
    #m_CompressedSizes;
    
    /**
     * Total Compressed Size
     * @type {number}
     */
    #m_TotalCompressedSize;
    
    /**
     * Width
     * @type {number}
     */
    #m_Width;
    
    /**
     * Height
     * @type {number}
     */
    #m_Height;
    
    /**
     * Dummy 2
     * @type {Uint8Array}
     */
    #m_Dummy2;

    /**
     * Compressed Palette Indexes
     * @type {number[]}
     */
    #m_CompressedPaletteIndexes;
    //#endregion

    //#region Properties
    /**
     * Gets the value of the Signature
     * @readonly
     * @returns {number}
     */
    get Signature() { return this.#m_Signature; }
    
    /**
     * Gets the value of the Frame Width
     * @readonly
     * @type {number}
     */
    get FrameWidth() { return this.#m_FrameWidth; }
    
    /**
     * Gets the value of the Frame Height
     * @readonly
     * @type {number}
     */
    get FrameHeight(){ return this.#m_FrameHeight; }
    
    /**
     * Gets the value of the Number of the Frames
     * @readonly
     * @type {number}
     */
    get NumberOfFrames() { return this.#m_NumberOfFrames; }
    
    /**
     * Gets the array of the Dummy1
     * @readonly
     * @type {number[]}
     */
    get Dummy1() { return [...this.#m_Dummy1]; }
    
    /**
     * Gets the array of the Offset
     * @readonly
     * @type {number[]}
     */
    get Offsets() { return [...this.#m_Offsets]; }
    
    /**
     * Gets the array of the Compressed Size
     * @readonly
     * @type {number[]}
     */
    get CompressedSizes() { return [...this.#m_CompressedSizes]; }
    
    /**
     * Gets the value of the Total Compressed Size
     * @readonly
     * @type {number}
     */
    get TotalCompressedSize() { return this.#m_TotalCompressedSize; }
    
    /**
     * Gets the value of the Width
     * @readonly
     * @type {number}
     */
    get Width() { return this.#m_Width; }
    
    /**
     * Gets the value of the Height
     * @readonly
     * @type {number}
     */
    get Height() { return this.#m_Height; }
    
    /**
     * Gets the array of the Compressed Palette Index
     * @readonly
     * @type {number[]}
     */
    get CompressedPaletteIndexes() { return [...this.#m_CompressedPaletteIndexes]; }
    
    /**
     * Gets the array o the Uncompressed Palette Index
     * @readonly
     * @type {Uint8Array}
     */
    get UncompressedPaletteIndexes() { 
        let uncompressedPaletteIndexes = new Uint8Array(this.#m_Width * this.#m_Height);
        let index = 0;
        for (let i = 0; i < this.#m_CompressedPaletteIndexes.length;) {
            const value = this.#m_CompressedPaletteIndexes[i];
            if (value === 0xFE) {
                const count = this.#m_CompressedPaletteIndexes[i + 1];
                
                for (let j = 0; j < count; ++j) {
                    uncompressedPaletteIndexes[index] = 0xFE;
                    index += 1;
                }
                i += 2;
            } else {
                uncompressedPaletteIndexes[index] = value;
                index += 1;
                i += 1;
            }
        }
        
        return uncompressedPaletteIndexes;
    }
    
    /**
     * Gets the value of the Number of X Frames
     * @readonly
     * @type {number}
     */
    get NumberOfXFrames() { return Math.floor(this.#m_Width / this.#m_FrameWidth); }
    
    /**
     * Gets the value of the Number of Y Frames
     * @readonly
     * @type {number}
     */
    get NumberOfYFrames() { return Math.floor(this.#m_Height / this.#m_FrameHeight); }
    //#endregion

    //#region Constructor
    /**
     * Constructor
     * @constructor
     */
    constructor() {
        this.#m_Signature = 0;
        this.#m_FrameWidth = 0;
        this.#m_FrameHeight = 0;
        this.#m_NumberOfFrames = 0;
        this.#m_Dummy1 = new Uint8Array(SPR.MAX_DUMMY1_SIZE);
        this.#m_Offsets = new Uint32Array(SPR.MAX_OFFSET_SIZE);
        this.#m_CompressedSizes = new Uint16Array(SPR.MAX_COMPRESSED_SIZE);
        this.#m_TotalCompressedSize = 0;
        this.#m_Width = 0;
        this.#m_Height = 0;
        this.#m_Dummy2 = new Uint8Array(SPR.MAX_DUMMY2_SIZE);
        this.#m_CompressedPaletteIndexes = [];
    }
    //#endregion

    //#region Public Methods
    /**
     * Load the SPR file
     * @param {ArrayBuffer} arrayBuffer ArrayBuffer
     * @returns {boolean}
     */
    Load(arrayBuffer) {
        if (arrayBuffer?.byteLength > 0) {
            // DataView
            const dv = new DataView(arrayBuffer);
            let offset = 0;

            // Check for Signature
            if (dv.getUint32(offset, true) !== 0x09) { return false; }
            this.#m_Signature = 0x09; offset += 4;

            // Frame Width, Frame Height
            this.#m_FrameWidth = dv.getUint32(offset, true); offset += 4;
            this.#m_FrameHeight = dv.getUint32(offset, true); offset += 4;

            // Number of Frames
            this.#m_NumberOfFrames = dv.getUint32(offset, true); offset += 4;

            // Dummy 1
            this.#m_Dummy1.set(new Uint8Array(arrayBuffer, offset, SPR.MAX_DUMMY1_SIZE)); offset += SPR.MAX_DUMMY1_SIZE;

            // Offsets
            this.#m_Offsets.set(new Uint32Array(arrayBuffer, offset, SPR.MAX_OFFSET_SIZE)); offset += (SPR.MAX_OFFSET_SIZE << 2);

            // Compressed Sizes
            this.#m_CompressedSizes.set(new Uint16Array(arrayBuffer, offset, SPR.MAX_COMPRESSED_SIZE)); offset += (SPR.MAX_COMPRESSED_SIZE << 1);

            // Total Compressed Size
            this.#m_TotalCompressedSize = dv.getUint32(offset, true); offset += 4;

            // Width, Height
            this.#m_Width = dv.getUint32(offset, true); offset += 4;
            this.#m_Height = dv.getUint32(offset, true); offset += 4;

            // Dummy 2
            this.#m_Dummy2.set(new Uint8Array(arrayBuffer, offset, SPR.MAX_DUMMY2_SIZE)); offset += SPR.MAX_DUMMY2_SIZE;

            // Compressed Palette Indexes
            this.#m_CompressedPaletteIndexes = Array.from(new Uint8Array(arrayBuffer, offset));

            return true;
        }

        return false;
    }

    /**
     * Save the SPR file
     * @returns {ArrayBuffer}
     */
    Save() {
        if (this.#m_Signature !== 0x09) { return null; }

        // File Size
        const fileSize =    4 +                                         // Signature
                            8 +                                         // Frame Width, Frame Height
                            4 +                                         // Number Of Frames
                            SPR.MAX_DUMMY1_SIZE +                       // Dummy 1
                            (SPR.MAX_OFFSET_SIZE << 2) +                // Offsets
                            (SPR.MAX_COMPRESSED_SIZE << 1) +            // Compressed Sizes
                            4 +                                         // Total Compressed Size
                            8 +                                         // Width, Height
                            SPR.MAX_DUMMY2_SIZE +                       // Dummy 2
                            this.#m_CompressedPaletteIndexes.length;    // Compressed Palette Indexes
        
        // ArrayBuffer
        const arrayBuffer = new ArrayBuffer(fileSize);

        // DataView
        const dv = new DataView(arrayBuffer);
        let offset = 0;

        // Signature
        dv.setUint32(offset, this.#m_Signature, true); offset += 4;

        // Frame Width, Frame Height
        dv.setUint32(offset, this.#m_FrameWidth, true); offset += 4;
        dv.setUint32(offset, this.#m_FrameHeight, true); offset += 4;

        // Number Of Frames
        dv.setUint32(offset, this.#m_NumberOfFrames, true); offset += 4;

        // Dummy 1
        new Uint8Array(arrayBuffer, offset, SPR.MAX_DUMMY1_SIZE).set(new Array(SPR.MAX_DUMMY1_SIZE).fill(0x00)); offset += SPR.MAX_DUMMY1_SIZE;

        // Offsets
        new Uint32Array(arrayBuffer, offset, SPR.MAX_OFFSET_SIZE).set(this.#m_Offsets); offset += (SPR.MAX_OFFSET_SIZE << 2);

        // Compressed Sizes
        new Uint16Array(arrayBuffer, offset, SPR.MAX_COMPRESSED_SIZE).set(this.#m_CompressedSizes); offset += (SPR.MAX_COMPRESSED_SIZE << 1);

        // Total Compressed Size
        dv.setUint32(offset, this.#m_TotalCompressedSize, true); offset += 4;

        // Width, Height
        dv.setUint32(offset, this.#m_Width, true); offset += 4;
        dv.setUint32(offset, this.#m_Height, true); offset += 4;

        // Dummy 2
        new Uint8Array(arrayBuffer, offset, SPR.MAX_DUMMY2_SIZE).set(new Array(SPR.MAX_DUMMY2_SIZE).fill(0x00)); offset += SPR.MAX_DUMMY2_SIZE;

        // Compressed Palette Indexes
        new Uint8Array(arrayBuffer, offset).set(this.#m_CompressedPaletteIndexes);

        return arrayBuffer;
    }
    
    /**
     * Apply to the new Palette Indexes
     * @param {number[]} newPaletteIndexes 
     * @returns {boolean} 
     */
    ApplyNewPaletteIndexes(newPaletteIndexes) {
        if (newPaletteIndexes?.length === 0 || newPaletteIndexes.length > 256) {
            return false;
        }

        for (let i = 0; i < this.#m_CompressedPaletteIndexes.length;) {
            if (this.#m_CompressedPaletteIndexes[i] === 0xFE) { i += 2; }
            else {
                this.#m_CompressedPaletteIndexes[i] = newPaletteIndexes[this.#m_CompressedPaletteIndexes[i]];
                i += 1;
            }
        }

        return true;
    }

    /**
     * Convert to JSON
     * @returns {JSON}
     */
    ToJSON() {
        if (this.#m_Signature !== 0x09) { return null; }
        
        return {
            FrameWidth: this.#m_FrameWidth,
            FrameHeight: this.#m_FrameHeight,
            NumberOfFrames: this.#m_NumberOfFrames,
            NumberOfXFrames: this.NumberOfXFrames,
            NumberOfYFrames: this.NumberOfYFrames,
            Width: this.#m_Width,
            Height: this.#m_Height,
            CompressedPaletteIndexes: this.#m_CompressedPaletteIndexes,
            UncompressedPaletteIndexes: this.UncompressedPaletteIndexes,
        };
    }
    //#endregion
};