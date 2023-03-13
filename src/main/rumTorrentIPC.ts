import { ipcMain, webContents } from 'electron';
import { FastifyInstance } from 'fastify';
import { Summary, torrent } from 'rum-torrent';

// export const state = {
//   server: null as null | FastifyInstance,
//   port: 0,
//   process: null as null | ChildProcess,

//   get up() {
//     return !!this.process;
//   },
// };
export const state = {
  server: null as null | FastifyInstance,
  up: false,
  summary: null as null | Summary,
};

const pushStatus = () => {
  webContents.getAllWebContents().forEach((v) => {
    v.send('rum-torrent-ipc-summary', {
      up: state.up,
      summary: state.summary,
    });
  });
};

export const actions = {
  up: async (param: { seed: string }) => {
    // TODO ignore request while up or down
    if (state.up) { return; }
    await torrent.init({
      callback: (summary) => {
        state.summary = summary;
        pushStatus();
      },
    });
    await torrent.seed(param.seed);
    state.up = true;
    pushStatus();

    // const rumTorrentProcess = childProcess.spawn(
    //   // TODO:
    //   'node',
    //   [
    //     join(process.cwd(), 'rum-torrent.mjs'),
    //     '--seed',
    //     param.seed,
    //     '--port',
    //     String(state.port),
    //   ],
    //   {
    //     shell: !!isDarwin,
    //     // cwd: 'C:\\src\\rum-torrent',
    //   },
    // );
    // rumTorrentProcess.on('error', (err) => {
    //   actions.down();
    //   console.error(err);
    // });
    // rumTorrentProcess.on('exit', () => {
    //   state.process = null;
    //   console.log('rum torrent exit');
    //   webContents.getAllWebContents().forEach((v) => {
    //     v.send('rum-torrent-ipc-summary', {
    //       type: 'up',
    //       data: state.up,
    //     });
    //   });
    // });
    // rumTorrentProcess.stdout.pipe(process.stdout);
    // rumTorrentProcess.stderr.pipe(process.stderr);
    // state.process = rumTorrentProcess;
    // webContents.getAllWebContents().forEach((v) => {
    //   v.send('rum-torrent-ipc-summary', {
    //     type: 'up',
    //     data: state.up,
    //   });
    // });
    console.log('rum torrent up');
  },
  down: async () => {
    // TODO ignore request while up or down
    if (!state.up) { return; }
    await torrent.end();
    state.up = false;
    console.log('torrent down');
    // state.process?.kill();
    // state.process = null;
    pushStatus();
    console.log('rum torrent down');
  },
};

export const initRumTorrentIPC = () => {
  ipcMain.on('rum-torrent-ipc', async (event, arg) => {
    try {
      const result = await (actions as any)[arg.action](arg.param);
      event.sender.send('rum-torrent-ipc', {
        id: arg.id,
        data: result,
        error: null,
      });
    } catch (err) {
      console.error(err);
      event.sender.send('rum-torrent-ipc', {
        id: arg.id,
        data: null,
        error: (err as Error).message,
      });
    }
  });
};
