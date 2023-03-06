import childProcess, { ChildProcess } from 'child_process';
import { ipcMain, webContents } from 'electron';
import { join } from 'path';
import getPort from 'get-port';
import { fastify, FastifyInstance } from 'fastify';

const isDarwin = process.platform === 'darwin';

export const state = {
  server: null as null | FastifyInstance,
  port: 0,
  process: null as null | ChildProcess,

  get up() {
    return !!this.process;
  },
};


export const actions = {
  up: (param: { seed: string }) => {
    if (state.process) { return; }

    const rumTorrentProcess = childProcess.spawn(
      // TODO:
      'node',
      [
        join(process.cwd(), 'rum-torrent.mjs'),
        '--seed',
        param.seed,
        '--port',
        String(state.port),
      ],
      {
        shell: !!isDarwin,
        // cwd: 'C:\\src\\rum-torrent',
      },
    );
    rumTorrentProcess.on('error', (err) => {
      actions.down();
      console.error(err);
    });
    rumTorrentProcess.on('exit', () => {
      state.process = null;
      console.log('rum torrent exit');
      webContents.getAllWebContents().forEach((v) => {
        v.send('rum-torrent-ipc-summary', {
          type: 'up',
          data: state.up,
        });
      });
    });
    rumTorrentProcess.stdout.pipe(process.stdout);
    rumTorrentProcess.stderr.pipe(process.stderr);
    state.process = rumTorrentProcess;
    webContents.getAllWebContents().forEach((v) => {
      v.send('rum-torrent-ipc-summary', {
        type: 'up',
        data: state.up,
      });
    });
    console.log('rum torrent up');
  },
  down: () => {
    if (!state.up) { return; }
    console.log('torrent down');
    state.process?.kill();
    state.process = null;
    webContents.getAllWebContents().forEach((v) => {
      v.send('rum-torrent-ipc-summary', {
        type: 'up',
        data: state.up,
      });
    });
    console.log('rum torrent down');
  },
};

export const initRumTorrentIPC = async () => {
  const port = await getPort();
  state.port = port;
  const server = fastify({
    logger: false,
  });
  server.post('/pt-summary', (req) => {
    webContents.getAllWebContents().forEach((v) => {
      v.send('rum-torrent-ipc-summary', {
        type: 'summary',
        data: req.body,
      });
    });
  });
  server.listen({ host: '::', port });
  state.server = server;

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
