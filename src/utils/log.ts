import { ipcRenderer } from 'electron';
import fs from 'fs-extra';

const exportLogs = async () => {
  await saveMainLogs();
  try {
    const file = await ipcRenderer.invoke('save-dialog', {
      defaultPath: 'logs.txt',
    });
    if (!file.canceled && file.filePath) {
      await fs.writeFile(
        file.filePath.toString(),
        ((console as any).logs || []).join('\n\r'),
      );
    }
  } catch (err) {
    console.error(err);
  }
};

const toJSONString = (args: any) => args.map((arg: any) => {
  if (typeof arg === 'object') {
    return JSON.stringify(arg);
  }
  return arg;
});

const setup = () => {
  try {
    (console as any).logs = [];
    (console as any).defaultLog = console.log.bind(console);
    console.log = function log(...args: Array<any>) {
      try {
        (console as any).logs.push(toJSONString(Array.from(args)));
      } catch (err) {}
      if (process.env.NODE_ENV === 'development') {
        const stack = new Error().stack!;
        const matchedStack = /at console.log.*\n.*?\((.*)\)/.exec(stack);
        const location = matchedStack ? matchedStack[1].trim() : '';
        if (location.includes('node_modules')) {
          (console as any).defaultLog.apply(console, args);
        } else {
          (console as any).defaultLog.apply(console, [`${location}\n`, ...args]);
        }
      } else {
        (console as any).defaultLog.apply(console, args);
      }
    };
    (console as any).defaultError = console.error.bind(console);
    console.error = function error(...args: Array<any>) {
      try {
        (console as any).logs.push(Array.from(args)[0].message);
        (console as any).logs.push(Array.from(args));
      } catch (err) {}
      (console as any).defaultError.apply(console, args);
    };
    window.onerror = function onerror(error) {
      (console as any).logs.push(error);
    };

    if (process.env.NODE_ENV !== 'development') {
      console.log(window.navigator.userAgent);
    }

    ipcRenderer.on('export-logs', exportLogs);
  } catch (err) {
    console.error(err);
  }
};


const saveMainLogs = async () => {
  ipcRenderer.send('get_main_log');

  const mainLogs = await new Promise((rs) => {
    ipcRenderer.once('response_main_log', (_event, args) => {
      rs(args.data);
    });
  });

  console.log('=================== Main Process Logs ==========================');
  console.log(mainLogs);
};

export default {
  setup,
  exportLogs,
};
