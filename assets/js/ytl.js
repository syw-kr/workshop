/** 
 * @file A JavaScript class for SYW(Seven Years War)'s YTL file
 * @author AnNoying
 * @version 1.0.0
 */

/**
 * YTL(Yimjinrok Tile)
 * @class YTL
 */
class YTL {
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
     * Tile Width
     * @type {number}
     */
    #m_TileWidth;

    /**
     * Tile Height
     * @type {number}
     */
    #m_TileHeight;

    /**
     * Number of Tiles
     * @type {number}
     */
    #m_NumberOfTiles;

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
     * Gets the value of the Tile Width
     * @readonly
     * @type {number}
     */
    get TileWidth() { return this.#m_TileWidth; }
    
    /**
     * Gets the value of the Tile Height
     * @readonly
     * @type {number}
     */
    get TileHeight(){ return this.#m_TileHeight; }
    
    /**
     * Gets the value of the Number of the Tiles
     * @readonly
     * @type {number}
     */
    get NumberOfTiles() { return this.#m_NumberOfTiles; }
    
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
        let uncompressedPaletteIndexes = new Uint8Array(this.#m_Width * this.#m_Height).fill(0xFE);

        let index = 0;

        for (let i = 0; i < this.#m_CompressedPaletteIndexes.length;) {
            const feCount = this.#m_CompressedPaletteIndexes[i];      // 투명 인덱스 개수
            const normalCount = this.#m_CompressedPaletteIndexes[i + 1]; // 일반 인덱스 개수
        
            // 투명 인덱스 채우기
            index += feCount;
        
            // 일반 인덱스 채우기
            for (let j = 0; j < normalCount; ++j) {
                uncompressedPaletteIndexes[index++] = this.#m_CompressedPaletteIndexes[i + 2 + j];
            }
        
            // 남은 공간을 투명 인덱스로 채우기
            index += this.#m_TileWidth - (feCount + normalCount);
            // index = Math.ceil(index / this.#m_TileWidth) * this.#m_TileWidth;
        
            // 다음 데이터 블록으로 이동
            i += (2 + normalCount);
        }
        
        return uncompressedPaletteIndexes;
    }
    
    /**
     * Gets the value of the Number of X Tiles
     * @readonly
     * @type {number}
     */
    get NumberOfXTiles() { return Math.floor(this.#m_Width / this.#m_TileWidth); }
    
    /**
     * Gets the value of the Number of Y Tiles
     * @readonly
     * @type {number}
     */
    get NumberOfYTiles() { return Math.floor(this.#m_Height / this.#m_TileHeight); }
    //#endregion

    //#region Constructor
    /**
     * Constructor
     * @constructor
     */
    constructor() {
        this.#m_Signature = 0;
        this.#m_TileWidth = 0;
        this.#m_TileHeight = 0;
        this.#m_NumberOfTiles = 0;
        this.#m_Dummy1 = new Uint8Array(YTL.MAX_DUMMY1_SIZE);
        this.#m_Offsets = new Uint32Array(YTL.MAX_OFFSET_SIZE);
        this.#m_CompressedSizes = new Uint16Array(YTL.MAX_COMPRESSED_SIZE);
        this.#m_TotalCompressedSize = 0;
        this.#m_Width = 0;
        this.#m_Height = 0;
        this.#m_Dummy2 = new Uint8Array(YTL.MAX_DUMMY2_SIZE);
        this.#m_CompressedPaletteIndexes = [];
    }
    //#endregion
    /**
     * Load the YTL file
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

            // Tile Width, Tile Height
            this.#m_TileWidth = dv.getUint32(offset, true); offset += 4;
            this.#m_TileHeight = dv.getUint32(offset, true); offset += 4;

            // Number of Tiles
            this.#m_NumberOfTiles = dv.getUint32(offset, true); offset += 4;

            // Dummy 1
            this.#m_Dummy1.set(new Uint8Array(arrayBuffer, offset, YTL.MAX_DUMMY1_SIZE)); offset += YTL.MAX_DUMMY1_SIZE;

            // Offsets
            this.#m_Offsets.set(new Uint32Array(arrayBuffer, offset, YTL.MAX_OFFSET_SIZE)); offset += (YTL.MAX_OFFSET_SIZE << 2);

            // Compressed Sizes
            this.#m_CompressedSizes.set(new Uint16Array(arrayBuffer, offset, YTL.MAX_COMPRESSED_SIZE)); offset += (YTL.MAX_COMPRESSED_SIZE << 1);

            // Total Compressed Size
            this.#m_TotalCompressedSize = dv.getUint32(offset, true); offset += 4;

            // Width, Height
            this.#m_Width = dv.getUint32(offset, true); offset += 4;
            this.#m_Height = dv.getUint32(offset, true); offset += 4;

            // Dummy 2
            this.#m_Dummy2.set(new Uint8Array(arrayBuffer, offset, YTL.MAX_DUMMY2_SIZE)); offset += YTL.MAX_DUMMY2_SIZE;

            // Compressed Palette Indexes
            this.#m_CompressedPaletteIndexes = Array.from(new Uint8Array(arrayBuffer, offset));

            return true;
        }

        return false;
    }

    /**
     * Save the YTL file
     * @returns {ArrayBuffer}
     */
    Save() {
        if (this.#m_Signature !== 0x09) { return null; }

        // File Size
        const fileSize =    4 +                                         // Signature
                            8 +                                         // Tile Width, Tile Height
                            4 +                                         // Number Of Tiles
                            YTL.MAX_DUMMY1_SIZE +                       // Dummy 1
                            (YTL.MAX_OFFSET_SIZE << 2) +                // Offsets
                            (YTL.MAX_COMPRESSED_SIZE << 1) +            // Compressed Sizes
                            4 +                                         // Total Compressed Size
                            8 +                                         // Width, Height
                            YTL.MAX_DUMMY2_SIZE +                       // Dummy 2
                            this.#m_CompressedPaletteIndexes.length;    // Compressed Palette Indexes
        
        // ArrayBuffer
        const arrayBuffer = new ArrayBuffer(fileSize);

        // DataView
        const dv = new DataView(arrayBuffer);
        let offset = 0;

        // Signature
        dv.setUint32(offset, this.#m_Signature, true); offset += 4;

        // Tile Width, Tile Height
        dv.setUint32(offset, this.#m_TileWidth, true); offset += 4;
        dv.setUint32(offset, this.#m_TileHeight, true); offset += 4;

        // Number Of Tiles
        dv.setUint32(offset, this.#m_NumberOfTiles, true); offset += 4;

        // Dummy 1
        new Uint8Array(arrayBuffer, offset, YTL.MAX_DUMMY1_SIZE).set(new Array(YTL.MAX_DUMMY1_SIZE).fill(0x00)); offset += YTL.MAX_DUMMY1_SIZE;

        // Offsets
        new Uint32Array(arrayBuffer, offset, YTL.MAX_OFFSET_SIZE).set(this.#m_Offsets); offset += (YTL.MAX_OFFSET_SIZE << 2);

        // Compressed Sizes
        new Uint16Array(arrayBuffer, offset, YTL.MAX_COMPRESSED_SIZE).set(this.#m_CompressedSizes); offset += (YTL.MAX_COMPRESSED_SIZE << 1);

        // Total Compressed Size
        dv.setUint32(offset, this.#m_TotalCompressedSize, true); offset += 4;

        // Width, Height
        dv.setUint32(offset, this.#m_Width, true); offset += 4;
        dv.setUint32(offset, this.#m_Height, true); offset += 4;

        // Dummy 2
        new Uint8Array(arrayBuffer, offset, YTL.MAX_DUMMY2_SIZE).set(new Array(YTL.MAX_DUMMY2_SIZE).fill(0x00)); offset += YTL.MAX_DUMMY2_SIZE;

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
            // 투명 인덱스의 수
            const feCount = this.#m_CompressedPaletteIndexes[i];

            // 일반 인덱스의 수
            const normalCount = this.#m_CompressedPaletteIndexes[i + 1];

            for (let j = 0; j < normalCount; ++j) {
                if (this.#m_CompressedPaletteIndexes[i + 2 + j] !== 0xFE) {
                    this.#m_CompressedPaletteIndexes[i + 2 + j] = newPaletteIndexes[this.#m_CompressedPaletteIndexes[i + 2 + j]];
                }
            }

            i += (2 + normalCount);
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
            TileWidth: this.#m_TileWidth,
            TileHeight: this.#m_TileHeight,
            NumberOfTiles: this.#m_NumberOfTiles,
            NumberOfXTiles: this.NumberOfXTiles,
            NumberOfYTiles: this.NumberOfYTiles,
            Width: this.#m_Width,
            Height: this.#m_Height,
            CompressedPaletteIndexes: this.#m_CompressedPaletteIndexes,
            UncompressedPaletteIndexes: this.UncompressedPaletteIndexes,
        };
    }
};