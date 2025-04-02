//#region Worker
const worker = new Worker("assets/js/worker.js")
worker.onmessage=e=>{
    const data = e.data;

    switch (data.msg) {
        case 'SPR': {
            if (data.error) {
                console.log(data.errorMsg);
                break;
            }

            switch (data.action) {
                case 'ANIM': {
                    const btnPlaySpr = document.getElementById('btnPlaySpr');
                    if (btnPlaySpr) {
                        btnPlaySpr.textContent = (data.payload.IsPlaying) ? '정지' : '재생';
                    }
                } break;

                case 'CONV_PAL': {
                    g_SYW.Spr.arrSpr[g_SYW.Spr.nSprId].ApplyNewPaletteIndexes(data.payload.NewPaletteIndexes);

                    const arrayBuffer = g_SYW.Spr.arrSpr[g_SYW.Spr.nSprId].Save();
                    if (arrayBuffer?.byteLength > 0) {
                        const select = document.getElementById('selectSpr');
                        const filename = select.options[select.selectedIndex].textContent.slice(0, -4) + '.spr';

                        fileDownload(arrayBuffer, filename, 'application/octet-stream');
                    }
                } break;
                
                case 'SPR2BMP': {
                    const select = document.getElementById('selectSpr');
                    const filename = select.options[select.selectedIndex].textContent.slice(0, -4) + '.bmp';

                    fileDownload(data.payload.BmpData, filename, 'image/bmp');
                } break;

                case 'BMP2SPR': {
                    fileDownload(data.payload.SprData, 'convert.spr', 'application/octet-stream');
                } break;
            }
        } break;

        case 'YTL': {
            if (data.error) {
                console.log(data.errorMsg);
                break;
            }

            switch (data.action) {
                case 'CONV_PAL': {
                    g_SYW.Ytl.arrYtl[g_SYW.Ytl.nYtlId].ApplyNewPaletteIndexes(data.payload.NewPaletteIndexes);

                    const arrayBuffer = g_SYW.Ytl.arrYtl[g_SYW.Ytl.nYtlId].Save();
                    if (arrayBuffer?.byteLength > 0) {
                        const select = document.getElementById('selectYtl');
                        const filename = select.options[select.selectedIndex].textContent.slice(0, -4) + '.ytl';

                        fileDownload(arrayBuffer, filename, 'application/octet-stream');
                    }
                } break;
                
                case 'YTL2BMP': {
                    const select = document.getElementById('selectYtl');
                    const filename = select.options[select.selectedIndex].textContent.slice(0, -4) + '.bmp';

                    fileDownload(data.payload.BmpData, filename, 'image/bmp');
                } break;

                case 'BMP2YTL': {
                    fileDownload(data.payload.YtlData, 'convert.ytl', 'application/octet-stream');
                } break;
            }
        } break;

        case 'YAV': {
            if (data.error) {
                console.log(data.errorMsg);
                break;
            }

            switch (data.action) {
                case 'YAV2WAV': {
                    const select = document.getElementById('selectYav');
                    const filename = select.options[select.selectedIndex].textContent.slice(0, -4) + '.wav';

                    fileDownload(data.payload.WavData, filename, 'application/octet-stream');
                } break;

                case 'WAV2YAV': {
                    fileDownload(data.payload.YavData, 'download.yav', 'application/octet-stream');
                } break;

                case 'ALLOC': {
                    const blob = new Blob([ data.payload.WavData ], { type: 'audio/wav' });
                    const url = URL.createObjectURL(blob);

                    const audio = document.getElementById('audioYav');
                    if (audio) {
                        audio.src = url;
                    }
                } break;
            }
        } break;
    }
};
//#endregion

//#region Global Variables
const g_SYW = {
    Spr: {
        // Variables
        arrSpr: [],         // SPR 목록
        arrPal: [],         // PAL 목록
        nSprId: -1,         // 선택 SPR Id
        nPalId: -1,         // 선택 PAL Id
        nConvPalId: -1,     // 변환 PAL Id
        bGrid: false,       // 격자
        nBgrnAlpha: 255,    // 배경 투명도
        nAlpha: 255,        // 일반 투명도

        // Functions
        EventOnChangeGrid: function(e) {
            if (this.arrSpr.length === 0 || this.nSprId === -1 || this.arrPal.length === 0 || this.nPalId === -1) { return; }
            if (!e.currentTarget) { return; }

            // 체크 상태 반영
            this.bGrid = e.currentTarget.checked;

            // 격자 추가
            const spr = document.getElementById('spr');
            const sprGrid = spr?.querySelector('#sprGrid');
            if (!sprGrid) {
                const grid = document.createElement('div');
                grid.id = 'sprGrid';
                grid.style.position='absolute';
                grid.style.top='0';
                grid.style.left='0';
                grid.style.width='100%';
                grid.style.height='100%';
                grid.style.backgroundImage='repeating-linear-gradient(var(--main-color) 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, var(--main-color) 0 1px, transparent 1px 100%)';
                grid.style.backgroundSize=`${this.arrSpr[this.nSprId].FrameWidth}px ${this.arrSpr[this.nSprId].FrameHeight}px`;
    
                spr.appendChild(grid);
            }

            if (this.bGrid) {
                sprGrid?.removeAttribute('hidden');
            } else {
                sprGrid?.setAttribute('hidden', '');
            }
        },
        EventOnInputBgrnAlpha: function(e) {
            if (!e.currentTarget) { return; }

            // Range
            const range = e.currentTarget;

            // 값 반영
            this.nBgrnAlpha = range.value;

            // 텍스트 갱신
            const span = range.nextElementSibling;
            if (span) {
                span.textContent = range.value;
            }
        },
        EventOnInputAlpha: function(e) {
            if (!e.currentTarget) { return; }

            // Range
            const range = e.currentTarget;

            // 값 반영
            this.nAlpha = range.value;

            // 텍스트 갱신
            const span = range.nextElementSibling;
            if (span) {
                span.textContent = range.value;
            }
        },
        fnDrawSpr: function() {
            if (this.arrSpr.length === 0 || this.nSprId === -1 || this.arrPal.length === 0 || this.nPalId === -1) { return; }

            worker.postMessage({
                msg: 'SPR',
                action: 'DRAW',
                payload: {
                    Spr: this.arrSpr[this.nSprId].ToJSON(),
                    Pal: this.arrPal[this.nPalId].ToJSON(),
                    BgrnAlpha: this.nBgrnAlpha,
                    Alpha: this.nAlpha,
                }
            });
        },
        EventOnChangeSelectSpr: function(e) {
            if (!e.currentTarget) { return; }

            // Spr Id
            this.nSprId = parseInt(e.currentTarget.value);

            // Spr Info
            const tr = document.querySelector('#tableSprInfo tbody tr');
            if (tr) {
                tr.innerHTML = `
                    <td>${this.arrSpr[this.nSprId].Width} &#10005; ${this.arrSpr[this.nSprId].Height}</td>
                    <td>${this.arrSpr[this.nSprId].FrameWidth} &#10005; ${this.arrSpr[this.nSprId].FrameHeight}</td>
                    <td>${this.arrSpr[this.nSprId].NumberOfXFrames} &#10005; ${this.arrSpr[this.nSprId].NumberOfYFrames}</td>
                `;
            }

            // Animation
            const startFrame = document.getElementById('numboxSprStartFrame');
            const endFrame = document.getElementById('numboxSprEndFrame');
            if (startFrame && endFrame) {
                startFrame.max = parseInt(this.arrSpr[this.nSprId].NumberOfFrames);
                endFrame.max = parseInt(this.arrSpr[this.nSprId].NumberOfFrames);
                endFrame.value = parseInt(this.arrSpr[this.nSprId].NumberOfFrames);
            }
        },
        fnLoadSpr: function() {
            openFileDialog('.spr', true, files => {
                for (let i = 0; i < files.length; ++i) {
                    const fr = new FileReader();
                    fr.onload = e => {
                        const spr = new SPR();
                        if (spr.Load(e.target.result)) {
                            this.arrSpr.push(spr);

                            const opt = document.createElement('option');
                            opt.value = (this.arrSpr.length - 1).toString();
                            opt.textContent = files[i].name;
                            document.getElementById('selectSpr')?.appendChild(opt);
                        }
                    };
                    fr.readAsArrayBuffer(files[i]);
                }
            });
        },
        fnExportBmp: function() {
            if (this.arrSpr.length === 0 || this.nSprId === -1 || this.arrPal.length === 0 || this.nPalId === -1) { return; }

            worker.postMessage({
                msg: 'SPR',
                action: 'SPR2BMP',
                payload: {
                    Spr: this.arrSpr[this.nSprId].ToJSON(),
                    Pal: this.arrPal[this.nPalId].ToJSON(),
                }
            });
        },
        EventOnchangeSelectPal4Spr: function(e) {
            if (!e.currentTarget) { return; }

            // Pal Id
            this.nPalId = parseInt(e.currentTarget.value);
        },
        EventOnchangeConvPal4Spr: function(e) {
            if (!e.currentTarget) { return; }

            // Conv Pal Id
            this.nConvPalId = parseInt(e.currentTarget.value);
        },
        fnLoadPal: function() {
            openFileDialog('.pal', true, files => {
                for (let i = 0; i < files.length; ++i) {
                    const fr = new FileReader();
                    fr.onload = e => {
                        const pal = new PAL();
                        if (pal.Load(e.target.result)) {
                            this.arrPal.push(pal);

                            const opt = document.createElement('option');
                            opt.value = (this.arrPal.length - 1).toString();
                            opt.textContent = files[i].name;
                            document.getElementById('selectPal4Spr')?.appendChild(opt);
                            document.getElementById('selectConvPal4Spr')?.appendChild(opt.cloneNode(true));
                        }
                    };
                    fr.readAsArrayBuffer(files[i]);
                }
            });
        },
        fnConvNSavePal: function() {
            if (this.arrSpr.length === 0 || this.nSprId === -1 || this.arrPal.length === 0 || this.nConvPalId === -1) { return; }

            worker.postMessage({
                msg:'SPR',
                action: 'CONV_PAL',
                payload: {
                    Pal1: this.arrPal[this.nPalId].ToJSON(),
                    Pal2: this.arrPal[this.nConvPalId].ToJSON(),
                }
            });
        },
        fnPlaySpr: function() {
            if (this.arrSpr.length === 0 || this.nSprId === -1 || this.arrPal.length === 0 || this.nPalId === -1) { return; }

            worker.postMessage({
                msg: 'SPR',
                action: 'ANIM',
                payload: {
                    Spr: this.arrSpr[this.nSprId].ToJSON(),
                    Pal: this.arrPal[this.nPalId].ToJSON(),
                    StartFrame: parseInt(document.getElementById('numboxSprStartFrame').value),
                    EndFrame: parseInt(document.getElementById('numboxSprEndFrame').value),
                    FrameSpeed: parseInt(document.getElementById('numboxSprFrameSpeed').value),
                    BgrnAlpha: this.nBgrnAlpha,
                    Alpha: this.nAlpha
                }
            });
        },
        fnConvImg4Spr: function() {
            openFileDialog('.bmp', false, files => {
                const fr = new FileReader();
                fr.onload=e=>{
                    worker.postMessage({
                        msg: 'SPR',
                        action: 'BMP2SPR',
                        payload: {
                            BmpData: e.target.result,
                            FrameWidth: parseInt(document.getElementById('numboxConvImg2SprFrameWidth').value),
                            FrameHeight: parseInt(document.getElementById('numboxConvImg2SprFrameHeight').value),
                            NumberOfFrames: parseInt(document.getElementById('numboxConvImg2SprNumberOfFrames').value)
                        },
                    });
                };
                fr.readAsArrayBuffer(files[0]);
            });
        },
    },
    Ytl: {
        // Variables
        arrYtl: [],         // SPR 목록
        arrPal: [],         // PAL 목록
        nYtlId: -1,         // 선택 YTL Id
        nPalId: -1,         // 선택 PAL Id
        nConvPalId: -1,     // 변환 PAL Id
        bGrid: false,       // 격자
        nBgrnAlpha: 255,    // 배경 투명도
        nAlpha: 255,        // 일반 투명도

        // Functions
        EventOnChangeGrid: function(e) {
            if (this.arrYtl.length === 0 || this.nYtlId === -1 || this.arrPal.length === 0 || this.nPalId === -1) { return; }
            if (!e.currentTarget) { return; }

            // 체크 상태 반영
            this.bGrid = e.currentTarget.checked;

            // 격자 추가
            const ytl = document.getElementById('ytl');
            const ytlGrid = ytl?.querySelector('#ytlGrid');
            if (!ytlGrid) {
                const grid = document.createElement('div');
                grid.id = 'ytlGrid';
                grid.style.position='absolute';
                grid.style.top='0';
                grid.style.left='0';
                grid.style.width='100%';
                grid.style.height='100%';
                grid.style.backgroundImage='repeating-linear-gradient(var(--main-color) 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, var(--main-color) 0 1px, transparent 1px 100%)';
                grid.style.backgroundSize=`${this.arrYtl[this.nYtlId].TileWidth}px ${this.arrYtl[this.nYtlId].TileHeight}px`;
    
                ytl.appendChild(grid);
            }

            if (this.bGrid) {
                ytlGrid?.removeAttribute('hidden');
            } else {
                ytlGrid?.setAttribute('hidden', '');
            }
        },
        EventOnInputBgrnAlpha: function(e) {
            if (!e.currentTarget) { return; }

            // Range
            const range = e.currentTarget;

            // 값 반영
            this.nBgrnAlpha = range.value;

            // 텍스트 갱신
            const span = range.nextElementSibling;
            if (span) {
                span.textContent = range.value;
            }
        },
        EventOnInputAlpha: function(e) {
            if (!e.currentTarget) { return; }

            // Range
            const range = e.currentTarget;

            // 값 반영
            this.nAlpha = range.value;

            // 텍스트 갱신
            const span = range.nextElementSibling;
            if (span) {
                span.textContent = range.value;
            }
        },
        fnDrawYtl: function() {
            if (this.arrYtl.length === 0 || this.nYtlId === -1 || this.arrPal.length === 0 || this.nPalId === -1) { return; }

            worker.postMessage({
                msg: 'YTL',
                action: 'DRAW',
                payload: {
                    Ytl: this.arrYtl[this.nYtlId].ToJSON(),
                    Pal: this.arrPal[this.nPalId].ToJSON(),
                    BgrnAlpha: this.nBgrnAlpha,
                    Alpha: this.nAlpha,
                }
            });
        },
        EventOnChangeSelectYtl: function(e) {
            if (!e.currentTarget) { return; }

            // Ytl Id
            this.nYtlId = parseInt(e.currentTarget.value);

            // Ytl Info
            const tr = document.querySelector('#tableYtlInfo tbody tr');
            if (tr) {
                tr.innerHTML = `
                    <td>${this.arrYtl[this.nYtlId].Width} &#10005; ${this.arrYtl[this.nYtlId].Height}</td>
                    <td>${this.arrYtl[this.nYtlId].TileWidth} &#10005; ${this.arrYtl[this.nYtlId].TileHeight}</td>
                    <td>${this.arrYtl[this.nYtlId].NumberOfXTiles} &#10005; ${this.arrYtl[this.nYtlId].NumberOfYTiles}</td>
                `;
            }
        },
        fnLoadYtl: function() {
            openFileDialog('.ytl', true, files => {
                for (let i = 0; i < files.length; ++i) {
                    const fr = new FileReader();
                    fr.onload = e => {
                        const ytl = new YTL();
                        if (ytl.Load(e.target.result)) {
                            this.arrYtl.push(ytl);

                            const opt = document.createElement('option');
                            opt.value = (this.arrYtl.length - 1).toString();
                            opt.textContent = files[i].name;
                            document.getElementById('selectYtl')?.appendChild(opt);
                        }
                    };
                    fr.readAsArrayBuffer(files[i]);
                }
            });
        },
        fnExportBmp: function() {
            if (this.arrYtl.length === 0 || this.nYtlId === -1 || this.arrPal.length === 0 || this.nPalId === -1) { return; }

            worker.postMessage({
                msg: 'YTL',
                action: 'YTL2BMP',
                payload: {
                    Ytl: this.arrYtl[this.nYtlId].ToJSON(),
                    Pal: this.arrPal[this.nPalId].ToJSON(),
                }
            });
        },
        EventOnchangeSelectPal4Ytl: function(e) {
            if (!e.currentTarget) { return; }

            // Pal Id
            this.nPalId = parseInt(e.currentTarget.value);
        },
        EventOnchangeConvPal4Ytl: function(e) {
            if (!e.currentTarget) { return; }

            // Conv Pal Id
            this.nConvPalId = parseInt(e.currentTarget.value);
        },
        fnLoadPal: function() {
            openFileDialog('.pal', true, files => {
                for (let i = 0; i < files.length; ++i) {
                    const fr = new FileReader();
                    fr.onload = e => {
                        const pal = new PAL();
                        if (pal.Load(e.target.result)) {
                            this.arrPal.push(pal);

                            const opt = document.createElement('option');
                            opt.value = (this.arrPal.length - 1).toString();
                            opt.textContent = files[i].name;
                            document.getElementById('selectPal4Ytl')?.appendChild(opt);
                            document.getElementById('selectConvPal4Ytl')?.appendChild(opt.cloneNode(true));
                        }
                    };
                    fr.readAsArrayBuffer(files[i]);
                }
            });
        },
        fnConvNSavePal: function() {
            if (this.arrYtl.length === 0 || this.nYtlId === -1 || this.arrPal.length === 0 || this.nConvPalId === -1) { return; }

            worker.postMessage({
                msg:'YTL',
                action: 'CONV_PAL',
                payload: {
                    Pal1: this.arrPal[this.nPalId].ToJSON(),
                    Pal2: this.arrPal[this.nConvPalId].ToJSON(),
                }
            });
        },
        fnConvImg4Ytl: function() {
            openFileDialog('.bmp', false, files => {
                const fr = new FileReader();
                fr.onload=e=>{
                    worker.postMessage({
                        msg: 'YTL',
                        action: 'BMP2YTL',
                        payload: {
                            BmpData: e.target.result,
                            TileWidth: parseInt(document.getElementById('numboxConvImg2YtlFrameWidth').value),
                            TileHeight: parseInt(document.getElementById('numboxConvImg2YtlFrameHeight').value),
                            NumberOfTiles: parseInt(document.getElementById('numboxConvImg2YtlNumberOfFrames').value)
                        },
                    });
                };
                fr.readAsArrayBuffer(files[0]);
            });
        },
    },
    Yav: {
        // Variables
        arrYav: [],
        nYavId: -1,

        // Functions
        EventOnChangeSelectYav: function(e) {
            if (!e.currentTarget) { return; }

            // Yav Id
            this.nYavId = parseInt(e.currentTarget.value);

            // Ytl Info
            const tr = document.querySelector('#tableYavInfo tbody tr');
            if (tr) {
                tr.innerHTML = `
                    <td>${Math.floor(this.arrYav[this.nYavId].Playtime / 60)}분 ${Math.floor(this.arrYav[this.nYavId].Playtime % 60)}초</td>
                `;
            }

            // Audio
            worker.postMessage({ 
                msg: 'YAV', 
                action: 'ALLOC', 
                payload: { 
                    Yav: this.arrYav[this.nYavId].ToJSON(), 
                }
            });
        },
        fnLoadYav: function() {
            openFileDialog('.yav', true, files => {
                for (let i = 0; i < files.length; ++i) {
                    const fr = new FileReader();
                    fr.onload = e => {
                        const yav = new YAV();
                        if (yav.Load(e.target.result)) {
                            this.arrYav.push(yav);

                            const opt = document.createElement('option');
                            opt.value = (this.arrYav.length - 1).toString();
                            opt.textContent = files[i].name;
                            document.getElementById('selectYav')?.appendChild(opt);
                        }
                    };
                    fr.readAsArrayBuffer(files[i]);
                }
            });
        },
        fnSaveWav: function() {
            if (this.arrYav.length === 0 || this.nYavId === -1) { return; }

            worker.postMessage({
                msg: 'YAV',
                action: 'YAV2WAV',
                payload: {
                    Yav: this.arrYav[this.nYavId].ToJSON(),
                }
            });
        },
        fnLoadNConvWav2Yav: function() {
            openFileDialog('.wav', false, files => {
                const fr = new FileReader();
                fr.onload=e=>{
                    worker.postMessage({
                        msg: 'YAV',
                        action: 'WAV2YAV',
                        payload: {
                            WavData: e.target.result
                        },
                    });
                };
                fr.readAsArrayBuffer(files[0]);
            });
        },
    },
};
//#endregion

//#region Functions
const toggleMenu=t=>{t.stopPropagation(),document.getElementById("menu")?.classList.toggle("show")};
const openTab=e=>{e?.length>0&&(document.querySelectorAll("#main>div")?.forEach(e=>e.hidden=!0),document.getElementById(e)?.removeAttribute("hidden"),document.querySelectorAll("#menu>div")?.forEach(e=>e.hidden=!0),document.getElementById(`${e}Menu`)?.removeAttribute("hidden"))};
const openFileDialog=(e,t,l)=>{let c=document.createElement("input");c.type="file",c.accept=e,c.multiple=t,c.onchange=e=>l(e.target.files),c.click()};
const fileDownload=(e,c,t)=>{let l=new Blob([e],{type:t}),o=URL.createObjectURL(l),a=document.createElement("a");a.href=o,a.download=c,a.click(),URL.revokeObjectURL(o)};
//#endregion

//#region Events
document.addEventListener('click', e => {
    // MENU
    const menu=document.getElementById("menu"),btnToggleMenu=document.getElementById("btnToggleMenu");
    !menu?.contains(e.target)&&btnToggleMenu&&btnToggleMenu!==e.target&&menu?.classList.remove("show");
});

document.addEventListener('DOMContentLoaded', () => {
    // Init
    const canvasOffscreen1 = document.getElementById('canvasSpr').transferControlToOffscreen();
    const canvasOffscreen2 = document.getElementById('canvasYtl').transferControlToOffscreen();
    worker.postMessage({
        msg: 'INIT',
        action: 'CANVAS',
        payload: {
            Canvas1: canvasOffscreen1,
            Canvas2: canvasOffscreen2,
        },
    }, [ canvasOffscreen1, canvasOffscreen2 ]);
});
//#endregion