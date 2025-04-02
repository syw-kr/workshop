/** 
 * @file Worker 
 * @author AnNoying
 * @version 1.0.0
 */

//#region Global Variables
const g_Worker = {
    Spr: {
        elCanvas: null,
        nAnimId: -1,
        arrAnimFramePixel: [],
        arrAnimImgData: [],
    },
    Ytl: {
        elCanvas: null,
    },
    Yav: {

    },
};
//#endregion

self.onmessage=e=>{
    const data = e.data;

    switch (data.msg) {
        case 'INIT': {
            if (data.action === 'CANVAS') {
                if (!data.payload.Canvas1 || !data.payload.Canvas2) {
                    self.postMessage({ msg: 'INIT', action: 'CANVAS', error: true, errorMsg: 'Canvas is null!' });
                    break;
                }

                g_Worker.Spr.elCanvas = data.payload.Canvas1;
                g_Worker.Ytl.elCanvas = data.payload.Canvas2;
            }
        } break;
        case 'SPR': { processSPR(data.action, data.payload); } break;
        case 'YTL': { processYTL(data.action, data.payload); } break;
        case 'YAV': { processYAV(data.action, data.payload); } break;
    }
};

/**
 * Process the SPR
 * @param {string} action 
 * @param {object} payload 
 */
const processSPR=(action,payload)=>{
    switch (action) {
        case 'DRAW': {
            if (!g_Worker.Spr.elCanvas) {
                self.postMessage({ msg: 'SPR', action: 'DRAW', error: true, errorMsg: 'Canvas is null' });
                break;
            }

            // 애니메이션 정지
            if (g_Worker.Spr.nAnimId !== -1) {
                cancelAnimationFrame(g_Worker.Spr.nAnimId);
                g_Worker.Spr.nAnimId = -1;
            }

            // SPR
            const spr = payload.Spr;
            if (!spr) {
                self.postMessage({ msg: 'SPR', action: 'DRAW', error: true, errorMsg: 'SPR is null' });
                break;
            }
            const uncompressedPaletteIndexes = spr.UncompressedPaletteIndexes;

            // Canvas, Context
            g_Worker.Spr.elCanvas.width     = spr.Width;
            g_Worker.Spr.elCanvas.height    = spr.Height;

            const ctx = g_Worker.Spr.elCanvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                self.postMessage({ msg: 'SPR', action: 'DRAW', error: true, errorMsg: 'Context is null' });
                break;
            }
            ctx.clearRect(0, 0, spr.Width, spr.Height);

            // Pixels
            let pixels = new Uint8ClampedArray((spr.Width * spr.Height) << 2);

            // Draw
            for (let frame = 0; frame < spr.NumberOfFrames; ++frame) {
                const frameX = frame % spr.NumberOfXFrames;
                const frameY = Math.floor(frame / spr.NumberOfXFrames);

                for (let y = 0; y < spr.FrameHeight; ++y) {
                    for (let x = 0; x < spr.FrameWidth; ++x) {
                        const index = x + (y * spr.FrameWidth) + (frame * spr.FrameWidth * spr.FrameHeight);
                        const color = payload.Pal.Color[uncompressedPaletteIndexes[index]];

                        const posX              = x + (frameX * spr.FrameWidth);
                        const posY              = y + (frameY * spr.FrameHeight);
                        const pixelIndex        = (posX + posY * spr.Width) << 2;
                        pixels[pixelIndex + 0]  = color.Red;
                        pixels[pixelIndex + 1]  = color.Green;
                        pixels[pixelIndex + 2]  = color.Blue;
                        pixels[pixelIndex + 3]  = (uncompressedPaletteIndexes[index] === 0xFE) ? payload.BgrnAlpha : payload.Alpha;
                    }
                }
            }
            const imgData = new ImageData(pixels, spr.Width, spr.Height);
            ctx.putImageData(imgData, 0, 0);
        } break;

        case 'ANIM': {
            if (!g_Worker.Spr.elCanvas) {
                self.postMessage({ msg: 'SPR', action: 'ANIM', error: true, errorMsg: 'Canvas is null' });
                break;
            }

            // 애니메이션 정지
            if (g_Worker.Spr.nAnimId !== -1) {
                cancelAnimationFrame(g_Worker.Spr.nAnimId);
                g_Worker.Spr.nAnimId = -1;

                self.postMessage({ msg: 'SPR', action: 'ANIM', error: false, errorMsg: '', payload: { IsPlaying: (g_Worker.Spr.nAnimId !== -1) }});
                break;
            }

            // SPR
            const spr = payload.Spr;
            if (!spr) {
                self.postMessage({ msg: 'SPR', action: 'ANIM', error: true, errorMsg: 'SPR is null' });
                break;
            }
            const uncompressedPaletteIndexes = spr.UncompressedPaletteIndexes;

            // Canvas, Context
            g_Worker.Spr.elCanvas.width     = spr.Width;
            g_Worker.Spr.elCanvas.height    = spr.Height;

            const ctx = g_Worker.Spr.elCanvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                self.postMessage({ msg: 'SPR', action: 'ANIM', error: true, errorMsg: 'Context is null' });
                break;
            }
            ctx.clearRect(0, 0, spr.Width, spr.Height);

            // 프레임 데이터 생성
            g_Worker.Spr.arrAnimFramePixel = new Array(payload.EndFrame - payload.StartFrame);
            g_Worker.Spr.arrAnimImgData = new Array(payload.EndFrame - payload.StartFrame);
            for (let frame = payload.StartFrame; frame < payload.EndFrame; ++frame) {
                let pixels = new Uint8ClampedArray((spr.FrameWidth * spr.FrameHeight) << 2);

                for (let y = 0; y < spr.FrameHeight; ++y) {
                    for (let x = 0; x < spr.FrameWidth; ++x) {
                        const index = x + (y * spr.FrameWidth) + (frame * spr.FrameWidth * spr.FrameHeight);
                        const color = payload.Pal.Color[uncompressedPaletteIndexes[index]];

                        const pixelIndex        = (x + y * spr.FrameWidth) << 2;
                        pixels[pixelIndex + 0]  = color.Red;
                        pixels[pixelIndex + 1]  = color.Green;
                        pixels[pixelIndex + 2]  = color.Blue;
                        pixels[pixelIndex + 3]  = (uncompressedPaletteIndexes[index] === 0xFE) ? payload.BgrnAlpha : payload.Alpha;
                    }
                }

                g_Worker.Spr.arrAnimFramePixel[frame - payload.StartFrame] = pixels;
                g_Worker.Spr.arrAnimImgData[frame - payload.StartFrame] = new ImageData(pixels, spr.FrameWidth, spr.FrameHeight);
            }

            // Play Anim
            let currentFrame    = payload.StartFrame;
            let lastFrameTime   = 0;
            const frameDuration = Math.floor(1000 / payload.FrameSpeed);
            const playAnim=timeStamp=>{
                const timeElapsed = timeStamp - lastFrameTime;
                if (timeElapsed >= frameDuration) {
                    lastFrameTime = timeStamp;

                    if (currentFrame < payload.EndFrame) {
                        const index = currentFrame - payload.StartFrame;
                        ctx.putImageData(g_Worker.Spr.arrAnimImgData[index], 0, 0);

                        currentFrame += 1;
                        if (currentFrame >= payload.EndFrame) {
                            currentFrame = payload.StartFrame;
                        }
                    }
                }

                g_Worker.Spr.nAnimId = requestAnimationFrame(playAnim);
            };
            g_Worker.Spr.nAnimId = requestAnimationFrame(playAnim);

            self.postMessage({ msg: 'SPR', action: 'ANIM', error: false, errorMsg: '', payload: { IsPlaying: (g_Worker.Spr.nAnimId !== -1) }});
        } break;

        case 'CONV_PAL': {
            const pal1 = payload.Pal1;
            const pal2 = payload.Pal2;

            let newPaletteIndexes = new Uint8Array(256);
            for (let i = 0; i < 256; ++i) {
                let minDist = Math.abs(pal2.Color[0].Red - pal1.Color[i].Red) + Math.abs(pal2.Color[0].Green - pal1.Color[i].Green) + Math.abs(pal2.Color[0].Blue - pal1.Color[i].Blue);

                let index = 0;
                for (let j = 1; j < 256; ++j) {
                    const dist = Math.abs(pal2.Color[j].Red - pal1.Color[i].Red) + Math.abs(pal2.Color[j].Green - pal1.Color[i].Green) + Math.abs(pal2.Color[j].Blue - pal1.Color[i].Blue);
                    if (minDist > dist) {
                        minDist = dist;
                        index = j;
                    }
                }

                newPaletteIndexes[i] = index;
            }

            self.postMessage({ msg: 'SPR', action: 'CONV_PAL', error: false, errorMsg: '', payload: { NewPaletteIndexes: newPaletteIndexes }});
        } break;

        case 'SPR2BMP': {
            // SPR
            const spr = payload.Spr;
            if (!spr) {
                self.postMessage({ msg: 'SPR', action: 'SPR2BMP', error: true, errorMsg: 'SPR is null' });
                break;
            }
            const uncompressedPaletteIndexes = spr.UncompressedPaletteIndexes;

            // Padding
            const padding = (4 - (spr.Width % 4)) % 4;

            // File Size
            const fileSize =    14 +                                // BITMAPFILEHEADER
                                40 +                                // BITMAPINFOHEADER
                                (256 << 2) +                        // Palette
                                (spr.Width + padding) * spr.Height; // Pixels
            
            // ArrayBuffer
            const arrayBuffer = new ArrayBuffer(fileSize);

            // DataView
            const dv = new DataView(arrayBuffer);
            let offset = 0;

            // BITMAPFILEHEADER
            dv.setUint16(offset, 0x4D42, true); offset += 2;            // 'BM' Signature
            dv.setUint32(offset, fileSize, true); offset += 4;          // File Size
            dv.setUint16(offset, 0, true); offset += 2;                 // Reversed 1
            dv.setUint16(offset, 0, true); offset += 2;                 // Reversed 2
            dv.setUint32(offset, 0x436, true); offset += 4;             // Pixels Offset

            // BITMAPINFOHEADER
            dv.setUint32(offset, 40, true); offset += 4;                                    // BITMAPINFOHEADER's Size
            dv.setUint32(offset, spr.Width, true); offset += 4;                             // Width
            dv.setInt32(offset, spr.Height * -1, true); offset += 4;                        // Height
            dv.setUint16(offset, 1, true); offset += 2;                                     // Planes
            dv.setUint16(offset, 8, true); offset += 2;                                     // Bit Count (8Bit)
            dv.setUint32(offset, 0, true); offset += 4;                                     // Compression
            dv.setUint32(offset, (spr.Width + padding) * spr.Height, true); offset += 4;    // Pixels Size
            dv.setUint32(offset, 0xB13, true); offset += 4;                                 // DPI for X (72dpi)
            dv.setUint32(offset, 0xB13, true); offset += 4;                                 // DPI for Y (72dpi)
            dv.setUint32(offset, 0, true); offset += 4;                                     // ClrUsed
            dv.setUint32(offset, 0, true); offset += 4;                                     // ClrImportant

            // Palette
            const color = payload.Pal.Color;
            for (let i = 0; i < 256; ++i) {
                // BGR0
                dv.setUint8(offset, color[i].Blue); offset += 1;
                dv.setUint8(offset, color[i].Green); offset += 1;
                dv.setUint8(offset, color[i].Red); offset += 1;
                dv.setUint8(offset, 0); offset += 1;
            }

            // Pixels
            for (let row = 0; row < spr.NumberOfYFrames; ++row) {
                for (let y = 0; y < spr.FrameHeight; ++y) {
                    for (let col = 0; col < spr.NumberOfXFrames; ++col) {
                        for (let x = 0; x < spr.FrameWidth; ++x) {
                            const frameIndex = col + (row * spr.NumberOfXFrames);
                            const index = x + (y * spr.FrameWidth) + (frameIndex * spr.FrameWidth * spr.FrameHeight);
                            
                            dv.setUint8(offset, uncompressedPaletteIndexes[index]);
                            offset += 1;
                        }
                    }

                    // Padding
                    for (let p = 0; p < padding; ++p) {
                        dv.setUint8(offset, 0);
                        offset += 1;
                    }
                }
            }

            self.postMessage({ msg: 'SPR', action: 'SPR2BMP', error: false, errorMsg: '', payload: { BmpData: arrayBuffer }}, [ arrayBuffer ]);
        } break;

        case 'BMP2SPR': {
            // DataView
            const dv = new DataView(payload.BmpData);
            let offset = 0;

            // BITMAPFILEHEADER
            const signature     = dv.getUint16(offset, true); offset += 2;
            if (signature !== 0x4D42) {
                self.postMessage({ msg: 'SPR', action: 'BMP2SPR', error: true, errorMsg: 'This bitmap is not supported' });
                break;
            }
            const fileSize      = dv.getUint32(offset, true); offset += 4;
            const reversed1     = dv.getUint16(offset, true); offset += 2;
            const reversed2     = dv.getUint16(offset, true); offset += 2;
            const pixelsOffset  = dv.getUint32(offset, true); offset += 4;

            // BITMAPINFOHEADER
            const headerSize    = dv.getUint32(offset, true); offset += 4;
            const width         = dv.getUint32(offset, true); offset += 4;
            let height          = dv.getInt32(offset, true); offset += 4;
            if (height < 0) { height = height * -1; }
            const planes        = dv.getUint16(offset, true); offset += 2;
            const bitCount      = dv.getUint16(offset, true); offset += 2;
            if (bitCount !== 8) {
                self.postMessage({ msg: 'SPR', action: 'BMP2SPR', error: true, errorMsg: 'This bitmap is not supported' });
                break;
            }
            const compression   = dv.getUint32(offset, true); offset += 4;
            if (compression !== 0) {
                self.postMessage({ msg: 'SPR', action: 'BMP2SPR', error: true, errorMsg: 'This bitmap is not supported' });
                break;
            }
            const pixelsSize    = dv.getUint32(offset, true); offset += 4;
            const dpiForX       = dv.getUint32(offset, true); offset += 4;
            const dpiForY       = dv.getUint32(offset, true); offset += 4;
            const clrUsed       = dv.getUint32(offset, true); offset += 4;
            const clrImportant  = dv.getUint32(offset, true); offset += 4;

            // Palette
            let palette = [];
            for (let i = 0; i < 256; ++i) {
                // BGR0
                const blue  = dv.getUint8(offset); offset += 1;
                const green = dv.getUint8(offset); offset += 1;
                const red   = dv.getUint8(offset); offset += 1;
                const zero  = dv.getUint8(offset); offset += 1;

                palette.push({
                    Red: red,
                    Green: green,
                    Blue: blue
                });
            }

            // Padding
            const padding = (4 - (width % 4)) % 4;

            // Uncompressed Palette Indexes
            let uncompressedPaletteIndexes  = new Uint8Array(width * height);
            const numberOfXFrames           = Math.floor(width / payload.FrameWidth);
            const numberOfYFrames           = Math.floor(height / payload.FrameHeight);
            for (let row = 0; row < numberOfYFrames; ++row) {
                for (let y = 0; y < payload.FrameHeight; ++y) {
                    for (let col = 0; col < numberOfXFrames; ++col) {
                        for (let x = 0; x < payload.FrameWidth; ++x) {
                            const frameIndex = col + (row * numberOfXFrames);
                            const index = x + (y * payload.FrameWidth) + (frameIndex * payload.FrameWidth * payload.FrameHeight);

                            uncompressedPaletteIndexes[index] = dv.getUint8(offset);
                            offset += 1;
                        }
                    }

                    // Padding
                    offset += padding;
                }
            }

            // --------------------

            // 데이터 압축
            let sprOffsets                  = new Uint32Array(300);
            let sprCompressedSizes          = new Uint16Array(300);
            let sprTotalCompressedSize      = 0;
            let sprCompressedPaletteIndexes = [];

            for (let frame = 0; frame < payload.NumberOfFrames; ++frame) {
                // 현재 프레임의 오프셋 기록
                sprOffsets[frame] = sprTotalCompressedSize;

                // 현재 압축된 크기
                let compressedSize = 0;
                for (let y = 0; y < payload.FrameHeight; ++y) {
                    for (let x = 0; x < payload.FrameWidth;) {
                        const index = x + (y * payload.FrameWidth) + (frame * payload.FrameWidth * payload.FrameHeight);
                        const value = uncompressedPaletteIndexes[index];

                        // 0xFE의 개수
                        if (value === 0xFE) {
                            let feCount = 0;
                            while (
                                (x + feCount) < payload.FrameWidth &&                       // FrameWidth를 넘기지 않았을 때
                                uncompressedPaletteIndexes[index + feCount] === 0xFE &&     // 다음 바이트도 0xFE 일 때
                                feCount < 0xFF) {                                           // 한 바이트의 최대 수까지
                                    feCount += 1;
                            }

                            // 데이터 추가
                            sprCompressedPaletteIndexes.push(0xFE, feCount);

                            // 압축 크기
                            compressedSize += 2;

                            // 다음 위치
                            x += feCount;
                        } else {
                            // 데이터 추가
                            sprCompressedPaletteIndexes.push(value);

                            // 압축 크기
                            compressedSize += 1;

                            // 다음 위치
                            x += 1;
                        }
                    }
                }

                // 압축 크기
                sprCompressedSizes[frame] = compressedSize & 0x00FF;    // 왜인지 모르겠지만... 하위 바이트를 버린다.
                sprTotalCompressedSize += compressedSize;
            }

            // File Size
            const sprFileSize =     4 +                                     // Signature
                                    8 +                                     // Frame Width, Frame Height
                                    4 +                                     // Number Of Frames
                                    1200 +                                  // Dummy 1
                                    (300 << 2) +                            // Offsets
                                    (300 << 1) +                            // Compressed Sizes
                                    4 +                                     // Total Compressed Size
                                    8 +                                     // Width, Height
                                    32 +                                    // Dummy 2
                                    sprCompressedPaletteIndexes.length;     // Compressed Palette Indexes
                                    
            // ArrayBuffer
            const sprArrayBuffer = new ArrayBuffer(sprFileSize);

            // DataView
            const sprDv = new DataView(sprArrayBuffer);
            let sprOffset = 0;

            sprDv.setUint32(sprOffset, 0x09, true); sprOffset += 4;
            sprDv.setUint32(sprOffset, payload.FrameWidth, true); sprOffset += 4;
            sprDv.setUint32(sprOffset, payload.FrameHeight, true); sprOffset += 4;
            sprDv.setUint32(sprOffset, payload.NumberOfFrames, true); sprOffset += 4;
            new Uint8Array(sprArrayBuffer, sprOffset, 1200).set(new Array(1200).fill(0x00)); sprOffset += 1200;
            new Uint32Array(sprArrayBuffer, sprOffset, 300).set(sprOffsets); sprOffset += (300 << 2);
            new Uint16Array(sprArrayBuffer, sprOffset, 300).set(sprCompressedSizes); sprOffset += (300 << 1);
            sprDv.setUint32(sprOffset, sprTotalCompressedSize, true); sprOffset += 4;
            sprDv.setUint32(sprOffset, width, true); sprOffset += 4;
            sprDv.setUint32(sprOffset, height, true); sprOffset += 4;
            new Uint8Array(sprArrayBuffer, sprOffset, 32).set(new Array(32).fill(0x00)); sprOffset += 32;
            new Uint8Array(sprArrayBuffer, sprOffset).set(sprCompressedPaletteIndexes);

            self.postMessage({ msg: 'SPR', action: 'BMP2SPR', error: false, errorMsg: '', payload: { SprData: sprArrayBuffer }}, [ sprArrayBuffer ]);
        } break;
    }
};

/**
 * Process the YTL
 * @param {string} action 
 * @param {object} payload 
 */
const processYTL=(action,payload)=>{
    switch (action) {
        case 'DRAW': {
            if (!g_Worker.Ytl.elCanvas) {
                self.postMessage({ msg: 'YTL', action: 'DRAW', error: true, errorMsg: 'Canvas is null' });
                break;
            }
            
            // YTL
            const ytl = payload.Ytl;
            if (!ytl) {
                self.postMessage({ msg: 'YTL', action: 'DRAW', error: true, errorMsg: 'YTL is null' });
                break;
            }
            const uncompressedPaletteIndexes = ytl.UncompressedPaletteIndexes;
            
            // Canvas, Context
            g_Worker.Ytl.elCanvas.width     = ytl.Width;
            g_Worker.Ytl.elCanvas.height    = ytl.Height;

            const ctx = g_Worker.Ytl.elCanvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                self.postMessage({ msg: 'YTL', action: 'DRAW', error: true, errorMsg: 'Context is null' });
                break;
            }
            ctx.clearRect(0, 0, ytl.Width, ytl.Height);

            // Pixels
            let pixels = new Uint8ClampedArray((ytl.Width * ytl.Height) << 2);

            // Draw
            for (let tile = 0; tile < ytl.NumberOfTiles; ++tile) {
                const tileX = tile % ytl.NumberOfXTiles;
                const tileY = Math.floor(tile / ytl.NumberOfXTiles);

                for (let y = 0; y < ytl.TileHeight; ++y) {
                    for (let x = 0; x < ytl.TileWidth; ++x) {
                        const index = x + (y * ytl.TileWidth) + (tile * ytl.TileWidth * ytl.TileHeight);
                        const color = payload.Pal.Color[uncompressedPaletteIndexes[index]];

                        const posX              = x + (tileX * ytl.TileWidth);
                        const posY              = y + (tileY * ytl.TileHeight);
                        const pixelIndex        = (posX + posY * ytl.Width) << 2;
                        pixels[pixelIndex + 0]  = color.Red;
                        pixels[pixelIndex + 1]  = color.Green;
                        pixels[pixelIndex + 2]  = color.Blue;
                        pixels[pixelIndex + 3]  = (uncompressedPaletteIndexes[index] === 0xFE) ? payload.BgrnAlpha : payload.Alpha;
                    }
                }
            }
            const imgData = new ImageData(pixels, ytl.Width, ytl.Height);
            ctx.putImageData(imgData, 0, 0);
        } break;

        case 'CONV_PAL': {
            const pal1 = payload.Pal1;
            const pal2 = payload.Pal2;

            let newPaletteIndexes = new Uint8Array(256);
            for (let i = 0; i < 256; ++i) {
                let minDist = Math.abs(pal2.Color[0].Red - pal1.Color[i].Red) + Math.abs(pal2.Color[0].Green - pal1.Color[i].Green) + Math.abs(pal2.Color[0].Blue - pal1.Color[i].Blue);

                let index = 0;
                for (let j = 1; j < 256; ++j) {
                    const dist = Math.abs(pal2.Color[j].Red - pal1.Color[i].Red) + Math.abs(pal2.Color[j].Green - pal1.Color[i].Green) + Math.abs(pal2.Color[j].Blue - pal1.Color[i].Blue);
                    if (minDist > dist) {
                        minDist = dist;
                        index = j;
                    }
                }

                newPaletteIndexes[i] = index;
            }

            self.postMessage({ msg: 'YTL', action: 'CONV_PAL', error: false, errorMsg: '', payload: { NewPaletteIndexes: newPaletteIndexes }});
        } break;

        case 'YTL2BMP': {
            // YTL
            const ytl = payload.Ytl;
            if (!ytl) {
                self.postMessage({ msg: 'YTL', action: 'YTL2BMP', error: true, errorMsg: 'YTL is null' });
                break;
            }
            const uncompressedPaletteIndexes = ytl.UncompressedPaletteIndexes;

            // Padding
            const padding = (4 - (ytl.Width % 4)) % 4;

            // File Size
            const fileSize =    14 +                                // BITMAPFILEHEADER
                                40 +                                // BITMAPINFOHEADER
                                (256 << 2) +                        // Palette
                                (ytl.Width + padding) * ytl.Height; // Pixels
            
            // ArrayBuffer
            const arrayBuffer = new ArrayBuffer(fileSize);

            // DataView
            const dv = new DataView(arrayBuffer);
            let offset = 0;

            // BITMAPFILEHEADER
            dv.setUint16(offset, 0x4D42, true); offset += 2;            // 'BM' Signature
            dv.setUint32(offset, fileSize, true); offset += 4;          // File Size
            dv.setUint16(offset, 0, true); offset += 2;                 // Reversed 1
            dv.setUint16(offset, 0, true); offset += 2;                 // Reversed 2
            dv.setUint32(offset, 0x436, true); offset += 4;             // Pixels Offset

            // BITMAPINFOHEADER
            dv.setUint32(offset, 40, true); offset += 4;                                    // BITMAPINFOHEADER's Size
            dv.setUint32(offset, ytl.Width, true); offset += 4;                             // Width
            dv.setInt32(offset, ytl.Height * -1, true); offset += 4;                        // Height
            dv.setUint16(offset, 1, true); offset += 2;                                     // Planes
            dv.setUint16(offset, 8, true); offset += 2;                                     // Bit Count (8Bit)
            dv.setUint32(offset, 0, true); offset += 4;                                     // Compression
            dv.setUint32(offset, (ytl.Width + padding) * ytl.Height, true); offset += 4;    // Pixels Size
            dv.setUint32(offset, 0xB13, true); offset += 4;                                 // DPI for X (72dpi)
            dv.setUint32(offset, 0xB13, true); offset += 4;                                 // DPI for Y (72dpi)
            dv.setUint32(offset, 0, true); offset += 4;                                     // ClrUsed
            dv.setUint32(offset, 0, true); offset += 4;                                     // ClrImportant

            // Palette
            const color = payload.Pal.Color;
            for (let i = 0; i < 256; ++i) {
                // BGR0
                dv.setUint8(offset, color[i].Blue); offset += 1;
                dv.setUint8(offset, color[i].Green); offset += 1;
                dv.setUint8(offset, color[i].Red); offset += 1;
                dv.setUint8(offset, 0); offset += 1;
            }

            // Pixels
            for (let row = 0; row < ytl.NumberOfYTiles; ++row) {
                for (let y = 0; y < ytl.TileHeight; ++y) {
                    for (let col = 0; col < ytl.NumberOfXTiles; ++col) {
                        for (let x = 0; x < ytl.TileWidth; ++x) {
                            const frameIndex = col + (row * ytl.NumberOfXTiles);
                            const index = x + (y * ytl.TileWidth) + (frameIndex * ytl.TileWidth * ytl.TileHeight);
                            
                            dv.setUint8(offset, uncompressedPaletteIndexes[index]);
                            offset += 1;
                        }
                    }

                    // Padding
                    for (let p = 0; p < padding; ++p) {
                        dv.setUint8(offset, 0);
                        offset += 1;
                    }
                }
            }

            self.postMessage({ msg: 'YTL', action: 'YTL2BMP', error: false, errorMsg: '', payload: { BmpData: arrayBuffer }}, [ arrayBuffer ]);
        } break;

        case 'BMP2YTL': {
            // ArrayBuffer
            const arrayBuffer = payload.BmpData;

            // DataView
            const dv = new DataView(arrayBuffer);
            let offset = 0;

            // BITMAPFILEHEADER
            const signature     = dv.getUint16(offset, true); offset += 2;
            if (signature !== 0x4D42) {
                self.postMessage({ msg: 'YTL', action: 'BMP2YTL', error: true, errorMsg: 'This bitmap is not supported' });
                break;
            }
            const fileSize      = dv.getUint32(offset, true); offset += 4;
            const reversed1     = dv.getUint16(offset, true); offset += 2;
            const reversed2     = dv.getUint16(offset, true); offset += 2;
            const pixelsOffset  = dv.getUint32(offset, true); offset += 4;

            // BITMAPINFOHEADER
            const headerSize    = dv.getUint32(offset, true); offset += 4;
            const width         = dv.getUint32(offset, true); offset += 4;
            let height          = dv.getInt32(offset, true); offset += 4;
            if (height < 0) { height = height * -1; }
            const planes        = dv.getUint16(offset, true); offset += 2;
            const bitCount      = dv.getUint16(offset, true); offset += 2;
            if (bitCount !== 8) {
                self.postMessage({ msg: 'YTL', action: 'BMP2YTL', error: true, errorMsg: 'This bitmap is not supported' });
                break;
            }
            const compression   = dv.getUint32(offset, true); offset += 4;
            if (compression !== 0) {
                self.postMessage({ msg: 'YTL', action: 'BMP2YTL', error: true, errorMsg: 'This bitmap is not supported' });
                break;
            }
            const pixelsSize    = dv.getUint32(offset, true); offset += 4;
            const dpiForX       = dv.getUint32(offset, true); offset += 4;
            const dpiForY       = dv.getUint32(offset, true); offset += 4;
            const clrUsed       = dv.getUint32(offset, true); offset += 4;
            const clrImportant  = dv.getUint32(offset, true); offset += 4;

            // Palette
            let palette = [];
            for (let i = 0; i < 256; ++i) {
                // BGR0
                const blue  = dv.getUint8(offset); offset += 1;
                const green = dv.getUint8(offset); offset += 1;
                const red   = dv.getUint8(offset); offset += 1;
                const zero  = dv.getUint8(offset); offset += 1;

                palette.push({
                    Red: red,
                    Green: green,
                    Blue: blue
                });
            }

            // Padding
            const padding = (4 - (width % 4)) % 4;

            // Uncompressed Palette Indexes
            let uncompressedPaletteIndexes  = new Uint8Array(width * height);
            const numberOfXTiles            = Math.floor(width / payload.TileWidth);
            const numberOfYTiles            = Math.floor(height / payload.TileHeight);
            for (let row = 0; row < numberOfYTiles; ++row) {
                for (let y = 0; y < payload.TileHeight; ++y) {
                    for (let col = 0; col < numberOfXTiles; ++col) {
                        for (let x = 0; x < payload.TileWidth; ++x) {
                            const frameIndex = col + (row * numberOfXTiles);
                            const index = x + (y * payload.TileWidth) + (frameIndex * payload.TileWidth * payload.TileHeight);

                            uncompressedPaletteIndexes[index] = dv.getUint8(offset);
                            offset += 1;
                        }
                    }

                    // Padding
                    offset += padding;
                }
            }

            // --------------------

            // 데이터 압축
            let ytlOffsets = new Uint32Array(300);
            let ytlCompressedPaletteIndexes = [];
            let ytlTotalCompressedSize = 0;
            
            for (let tile = 0; tile < payload.NumberOfTiles; ++tile) {
                // 현재 타일의 오프셋 기록
                ytlOffsets[tile] = ytlTotalCompressedSize;
            
                for (let y = 0; y < payload.TileHeight; ++y) {
                    const index = tile * payload.TileWidth * payload.TileHeight + y * payload.TileWidth;
                    if (index >= uncompressedPaletteIndexes.length) break;
            
                    // [1] 투명 인덱스 개수 계산
                    let feCount = 0;
                    for (let j = 0; j < payload.TileWidth && (index + j) < uncompressedPaletteIndexes.length; ++j) {
                        if (uncompressedPaletteIndexes[index + j] === 0xFE) {
                            feCount += 1;
                        } else {
                            break;
                        }
                    }
            
                    // [2] 일반 인덱스 개수 및 값 저장
                    let normalCount = 0;
                    let normalIndexes = [];
                    for (let j = feCount; j < payload.TileWidth && (index + j) < uncompressedPaletteIndexes.length; ++j) {
                        if (uncompressedPaletteIndexes[index + j] !== 0xFE) {
                            normalIndexes.push(uncompressedPaletteIndexes[index + j]);
                            normalCount += 1;
                        } else {
                            break;
                        }
                    }
            
                    // [3] 데이터 추가            
                    ytlCompressedPaletteIndexes.push(feCount);
                    ytlCompressedPaletteIndexes.push(normalCount);
                    ytlCompressedPaletteIndexes.push(...normalIndexes);
            
                    // 현재 압축 크기 업데이트
                    ytlTotalCompressedSize += 2 + normalCount;
                }
            }
            
            // File Size
            const ytlFileSize =     4 +                                     // Signature
                                    8 +                                     // Frame Width, Frame Height
                                    4 +                                     // Number Of Frames
                                    1200 +                                  // Dummy 1
                                    (300 << 2) +                            // Offsets
                                    (300 << 1) +                            // Compressed Sizes
                                    4 +                                     // Total Compressed Size
                                    8 +                                     // Width, Height
                                    32 +                                    // Dummy 2
                                    ytlCompressedPaletteIndexes.length;     // Compressed Palette Indexes

            // ArrayBuffer
            const ytlArrayBuffer = new ArrayBuffer(ytlFileSize);

            // DataView
            const ytlDv = new DataView(ytlArrayBuffer);
            let ytlOffset = 0;

            ytlDv.setUint32(ytlOffset, 0x09, true); ytlOffset += 4;
            ytlDv.setUint32(ytlOffset, payload.TileWidth, true); ytlOffset += 4;
            ytlDv.setUint32(ytlOffset, payload.TileHeight, true); ytlOffset += 4;
            ytlDv.setUint32(ytlOffset, payload.NumberOfTiles, true); ytlOffset += 4;
            new Uint8Array(ytlArrayBuffer, ytlOffset, 1200).set(new Array(1200).fill(0x00)); ytlOffset += 1200;
            new Uint32Array(ytlArrayBuffer, ytlOffset, 300).set(ytlOffsets); ytlOffset += (300 << 2);
            new Uint16Array(ytlArrayBuffer, ytlOffset, 300).set(new Array(300).fill(0x00)); ytlOffset += (300 << 1);
            ytlDv.setUint32(ytlOffset, ytlTotalCompressedSize, true); ytlOffset += 4;
            ytlDv.setUint32(ytlOffset, width, true); ytlOffset += 4;
            ytlDv.setUint32(ytlOffset, height, true); ytlOffset += 4;
            new Uint8Array(ytlArrayBuffer, ytlOffset, 32).set(new Array(32).fill(0x00)); ytlOffset += 32;
            new Uint8Array(ytlArrayBuffer, ytlOffset).set(ytlCompressedPaletteIndexes);

            self.postMessage({ msg: 'YTL', action: 'BMP2YTL', error: false, errorMsg: '', payload: { YtlData: ytlArrayBuffer }}, [ ytlArrayBuffer ]);
        } break;
    }
};

/**
 * Process the YAV
 * @param {string} action 
 * @param {object} payload 
 */
const processYAV=(action,payload)=>{
    switch (action) {        
        case 'ALLOC': {
            if (!payload.Yav) {
                self.postMessage({ msg: 'YAV', action: 'ALLOC', error: true, errorMsg: 'YAV is null' });
                break;
            }
            
            // FileSize
            const fileSize =    4 +                     // Chunk Id 1 ('RIFF')
                                4 +                     // Chunk Size 1
                                4 +                     // Format ('WAVE')
                                4 +                     // Chunk Id 2 ('fmt ')
                                4 +                     // Chunk Size 2
                                2 +                     // FormatTag
                                2 +                     // Channels
                                4 +                     // SamplesPerSec
                                4 +                     // AvgBytesPerSec
                                2 +                     // BlockAlign
                                2 +                     // BitsPerSec
                                // 2 +                     // Size
                                4 +                     // Chunk Id 3 ('data')
                                4 +                     // Chunk Size 3
                                payload.Yav.DataSize;   // PCM Data
            
            // ArrayBuffer
            const arrayBuffer = new ArrayBuffer(fileSize);

            // DataView
            const dv = new DataView(arrayBuffer);
            let offset = 0;

            dv.setUint32(offset, 0x52494646, false);                            offset += 4;    // Chunk Id 1 ('RIFF')
            dv.setUint32(offset, fileSize - 8, true);                           offset += 4;    // Chunk Size 1 - FileSize
            dv.setUint32(offset, 0x57415645, false);                            offset += 4;    // Format ('WAVE')
            dv.setUint32(offset, 0x666D7420, false);                            offset += 4;    // Chunk Id 2 ('fmt ')
            dv.setUint32(offset, 0x10, true);                                   offset += 4;    // Chunk Size 2
            dv.setUint16(offset, payload.Yav.WaveFormat.FormatTag, true);       offset += 2;    // Format Tag
            dv.setUint16(offset, payload.Yav.WaveFormat.Channels, true);        offset += 2;    // Cannels
            dv.setUint32(offset, payload.Yav.WaveFormat.SamplesPerSec, true);   offset += 4;    // SamplesPerSec
            dv.setUint32(offset, payload.Yav.WaveFormat.AvgBytesPerSec, true);  offset += 4;    // AvgBytesPerSec
            dv.setUint16(offset, payload.Yav.WaveFormat.BlockAlign, true);      offset += 2;    // BlockAlign
            dv.setUint16(offset, payload.Yav.WaveFormat.BitsPerSec, true);      offset += 2;    // BitsPerSec
            // dv.setUint16(offset, payload.Yav.WaveFormat.Size, true);            offset += 2;    // Size
            dv.setUint32(offset, 0x64617461, false);                            offset += 4;    // Chunk Id 3
            dv.setUint32(offset, payload.Yav.DataSize, true);                   offset += 4;    // DataSize
            new Uint8Array(arrayBuffer, offset).set(payload.Yav.Data);              // Data

            self.postMessage({ msg: 'YAV', action: 'ALLOC', error: false, errorMsg: '', payload: { WavData: arrayBuffer }}, [ arrayBuffer ]);
        } break;

        case 'YAV2WAV': {
            if (!payload.Yav) {
                self.postMessage({ msg: 'YAV', action: 'YAV2WAV', error: true, errorMsg: 'YAV is null' });
                break;
            }
            
            // FileSize
            const fileSize =    4 +                     // Chunk Id 1 ('RIFF')
                                4 +                     // Chunk Size 1
                                4 +                     // Format ('WAVE')
                                4 +                     // Chunk Id 2 ('fmt ')
                                4 +                     // Chunk Size 2
                                2 +                     // FormatTag
                                2 +                     // Channels
                                4 +                     // SamplesPerSec
                                4 +                     // AvgBytesPerSec
                                2 +                     // BlockAlign
                                2 +                     // BitsPerSec
                                // 2 +                     // Size
                                4 +                     // Chunk Id 3 ('data')
                                4 +                     // Chunk Size 3
                                payload.Yav.DataSize;   // PCM Data
            
            // ArrayBuffer
            const arrayBuffer = new ArrayBuffer(fileSize);

            // DataView
            const dv = new DataView(arrayBuffer);
            let offset = 0;

            dv.setUint32(offset, 0x52494646, false);                            offset += 4;    // Chunk Id 1 ('RIFF')
            dv.setUint32(offset, fileSize - 8, true);                           offset += 4;    // Chunk Size 1 - FileSize
            dv.setUint32(offset, 0x57415645, false);                            offset += 4;    // Format ('WAVE')
            dv.setUint32(offset, 0x666D7420, false);                            offset += 4;    // Chunk Id 2 ('fmt ')
            dv.setUint32(offset, 0x10, true);                                   offset += 4;    // Chunk Size 2
            dv.setUint16(offset, payload.Yav.WaveFormat.FormatTag, true);       offset += 2;    // Format Tag
            dv.setUint16(offset, payload.Yav.WaveFormat.Channels, true);        offset += 2;    // Cannels
            dv.setUint32(offset, payload.Yav.WaveFormat.SamplesPerSec, true);   offset += 4;    // SamplesPerSec
            dv.setUint32(offset, payload.Yav.WaveFormat.AvgBytesPerSec, true);  offset += 4;    // AvgBytesPerSec
            dv.setUint16(offset, payload.Yav.WaveFormat.BlockAlign, true);      offset += 2;    // BlockAlign
            dv.setUint16(offset, payload.Yav.WaveFormat.BitsPerSec, true);      offset += 2;    // BitsPerSec
            // dv.setUint16(offset, payload.Yav.WaveFormat.Size, true);            offset += 2;    // Size
            dv.setUint32(offset, 0x64617461, false);                            offset += 4;    // Chunk Id 3 ('data')
            dv.setUint32(offset, payload.Yav.DataSize, true);                   offset += 4;    // DataSize
            new Uint8Array(arrayBuffer, offset).set(payload.Yav.Data);              // Data

            self.postMessage({ msg: 'YAV', action: 'YAV2WAV', error: false, errorMsg: '', payload: { WavData: arrayBuffer }}, [ arrayBuffer ]);
        } break;

        case 'WAV2YAV': {
            if(!payload.WavData) {
                self.postMessage({ msg: 'YAV', action: 'WAV2YAV', error: true, errorMsg: 'WAV is null' });
                break;
            }

            // Check WAV
            // DataView
            const dv = new DataView(payload.WavData);
            let offset = 0;

            const chunkId1          = dv.getUint32(offset, true); offset += 4;
            const chunkSize1        = dv.getUint32(offset, true); offset += 4;
            const format            = dv.getUint32(offset, true); offset += 4;
            const chunkId2          = dv.getUint32(offset, true); offset += 4;
            const chunkSize2        = dv.getUint32(offset, true); offset += 4;
            const formatTag         = dv.getUint16(offset, true); offset += 2;
            if (formatTag !== 1) {
                self.postMessage({ msg: 'YAV', action: 'WAV2YAV', error: true, errorMsg: 'This wav is not linear pcm.' });
                break;
            }
            const channels          = dv.getUint16(offset, true); offset += 2;
            const samplesPerSec     = dv.getUint32(offset, true); offset += 4;
            const avgBytesPerSec    = dv.getUint32(offset, true); offset += 4;
            const blockAlign        = dv.getUint16(offset, true); offset += 2;
            const bitsPerSec        = dv.getUint16(offset, true); offset += 2;
            const chunkId3          = dv.getUint32(offset, true); offset += 4;
            const dataSize          = dv.getUint32(offset, true); offset += 4;
            let pcmData = [];
            pcmData = Array.from(new Uint8Array(payload.WavData, offset));

            // --------------------

            // YAV FileSize
            const fileSize =    4 +
                                2 +
                                2 +
                                4 +
                                4 +
                                2 +
                                2 +
                                2 +
                                4 +
                                pcmData.length;

            // ArrayBuffer
            const arrayBuffer = new ArrayBuffer(fileSize);

            // DataView
            const ytlDv = new DataView(arrayBuffer);
            let ytlOffset = 0;

            ytlDv.setUint32(ytlOffset, 0x12, true);             ytlOffset += 4;
            ytlDv.setUint16(ytlOffset, formatTag, true);        ytlOffset += 2;
            ytlDv.setUint16(ytlOffset, channels, true);         ytlOffset += 2;
            ytlDv.setUint32(ytlOffset, samplesPerSec, true);    ytlOffset += 4;
            ytlDv.setUint32(ytlOffset, avgBytesPerSec, true);   ytlOffset += 4;
            ytlDv.setUint16(ytlOffset, blockAlign, true);       ytlOffset += 2;
            ytlDv.setUint16(ytlOffset, bitsPerSec, true);       ytlOffset += 2;
            ytlDv.setUint16(ytlOffset, 0, true);                ytlOffset += 2;
            ytlDv.setUint32(ytlOffset, pcmData.length, true);   ytlOffset += 4;
            new Uint8Array(arrayBuffer, ytlOffset).set(pcmData);

            self.postMessage({ msg: 'YAV', action: 'WAV2YAV', error: false, errorMsg: '', payload: { YavData: arrayBuffer }}, [ arrayBuffer ]);
        } break;
    }
};