const e = process.electronBinding ? process.electronBinding('app') : require('electron/main'); console.log(typeof e);  
