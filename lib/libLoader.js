//LibLoader v1.0
//Written by Nekit270 (https://github.com/nekit270)

window.LibLoader = {
    load: function(libs, callback, errorCallback){
        console.log(this.version);

        let libContainer = document.createElement('div');
        libContainer.dataset.libLoader = '';
        document.body.appendChild(libContainer);

        let currentLib = 0;
        function loadNext(){
            if(currentLib == libs.length){
                if(callback) callback();
                return;
            }

            let lib = libs[currentLib];
            console.log(`[${window.LibLoader.prefix}] Загрузка ${lib.name}...`);

            let s = document.createElement('script');
            s.src = lib.url;
            s.onload = ()=>{
                console.log(`${window.LibLoader.loggerStyles.fg.green}[${window.LibLoader.prefix}] ${lib.name} загружен.`);
                currentLib++;
                loadNext();
            }
            s.onerror = ()=>{
                console.log(`${window.LibLoader.loggerStyles.fg.red}[${window.LibLoader.prefix}] Ошибка загрузки ${lib.name}.`);
                if(lib.errorAction == 'continue'){
                    currentLib++;
                    loadNext();
                }else{
                    if(errorCallback) errorCallback();
                }
                if(lib.onerror) lib.onerror();
            }
            libContainer.appendChild(s);
        }
        loadNext();
    },
    loggerStyles: {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        dim: '\x1b[2m',
        underscore: '\x1b[4m',
        blink: '\x1b[5m',
        reverse: '\x1b[7m',
        hidden: '\x1b[8m',
        fg: {
            black: '\x1b[30m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m'
        },
        bg: {
            black: '\x1b[40m',
            red: '\x1b[41m',
            green: '\x1b[42m',
            yellow: '\x1b[43m',
            blue: '\x1b[44m',
            magenta: '\x1b[45m',
            cyan: '\x1b[46m',
            white: '\x1b[47m'
        }
    },
    prefix: 'LibLoader',
    version: 'LibLoader 1.0.0'
}
