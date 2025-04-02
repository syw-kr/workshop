/** 
 * @file A JavaScript class for SYW(Seven Years War)'s YAV file
 * @author AnNoying
 * @version 1.0.0
 */

/**
 * YAV(Yimjinrok Wave)
 * @class YAV
 */
class YAV {
    //#region Inner Classes
    /**
     * WAVEFORMATEX
     * @class WAVEFORMATEX
     */
    WAVEFORMATEX = class {
        //#region Member Variables
        #m_wFormatTag;
        #m_nChannels;
        #m_nSamplesPerSec;
        #m_nAvgBytesPerSec;
        #m_nBlockAlign;
        #m_wBitsPerSec;
        #m_cbSize;
        //#endregion

        //#region Properties
        get FormatTag() { return this.#m_wFormatTag; }
        get Channels() { return this.#m_nChannels; }
        get SamplesPerSec() { return this.#m_nSamplesPerSec; }
        get AvgBytesPerSec() { return this.#m_nAvgBytesPerSec; }
        get BlockAlign() { return this.#m_nBlockAlign; }
        get BitsPerSec() { return this.#m_wBitsPerSec; }
        get Size() { return this.#m_cbSize; }

        set FormatTag(value) { this.#m_wFormatTag = value; }
        set Channels(value) { this.#m_nChannels = value; }
        set SamplesPerSec(value) { this.#m_nSamplesPerSec = value; }
        set AvgBytesPerSec(value) { this.#m_nAvgBytesPerSec = value; }
        set BlockAlign(value) { this.#m_nBlockAlign = value; }
        set BitsPerSec(value) { this.#m_wBitsPerSec = value; }
        set Size(value) { this.#m_cbSize = value; }
        //#endregion

        //#region Constructor
        constructor() {
            this.#m_wFormatTag = 0;
            this.#m_nChannels = 0;
            this.#m_nSamplesPerSec = 0;
            this.#m_nAvgBytesPerSec = 0;
            this.#m_nBlockAlign = 0;
            this.#m_wBitsPerSec = 0;
            this.#m_cbSize = 0;
        }
        //#endregion
    };
    //#endregion

    //#region Member Variables
    #m_Unknown;
    #m_WaveFormatEx;
    #m_DataSize;
    #m_Data;
    //#endregion

    //#region Properties
    get Unknown() { return this.#m_Unknown; }
    get WaveFormatEx() { return this.#m_WaveFormatEx; }
    get DataSize() { return this.#m_DataSize; }
    get Data() { return [...this.#m_Data]; }
    get Playtime() { return (this.#m_DataSize / this.#m_WaveFormatEx.AvgBytesPerSec); }
    //#endregion

    //#region Constructor
    constructor() {
        this.#m_Unknown = 0;
        this.#m_WaveFormatEx = new this.WAVEFORMATEX();
        this.#m_DataSize = 0;
        this.#m_Data = [];
    }
    //#endregion

    //#region Public Methods
    Load(arrayBuffer) {
        if (arrayBuffer?.byteLength > 0) {
            const dv = new DataView(arrayBuffer);
            let offset = 0;

            // Unknown
            this.#m_Unknown = dv.getUint32(offset, true); offset += 4;

            // WaveFormat
            this.#m_WaveFormatEx.FormatTag      = dv.getUint16(offset, true); offset += 2;
            this.#m_WaveFormatEx.Channels       = dv.getUint16(offset, true); offset += 2;
            this.#m_WaveFormatEx.SamplesPerSec  = dv.getUint32(offset, true); offset += 4;
            this.#m_WaveFormatEx.AvgBytesPerSec = dv.getUint32(offset, true); offset += 4;
            this.#m_WaveFormatEx.BlockAlign     = dv.getUint16(offset, true); offset += 2;
            this.#m_WaveFormatEx.BitsPerSec     = dv.getUint16(offset, true); offset += 2;
            this.#m_WaveFormatEx.Size           = dv.getUint16(offset, true); offset += 2;

            // Data Size
            this.#m_DataSize = dv.getUint32(offset, true); offset += 4;

            // Data
            this.#m_Data = Array.from(new Uint8Array(arrayBuffer, offset));
            
            return true;
        }

        return false;
    }

    ToJSON() {
        return {
            Unknown: this.#m_Unknown,
            DataSize: this.#m_DataSize,
            Data: [...this.#m_Data],
            WaveFormat: {
                FormatTag: this.#m_WaveFormatEx.FormatTag,
                Channels: this.#m_WaveFormatEx.Channels,
                SamplesPerSec: this.#m_WaveFormatEx.SamplesPerSec,
                AvgBytesPerSec: this.#m_WaveFormatEx.AvgBytesPerSec,
                BlockAlign: this.#m_WaveFormatEx.BlockAlign,
                BitsPerSec: this.#m_WaveFormatEx.BitsPerSec,
                Size: this.#m_WaveFormatEx.Size,
            }
        };
    }
    //#endregion
};