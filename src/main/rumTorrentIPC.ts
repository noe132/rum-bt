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
    if (!state.up) {
      state.up = true;
      await torrent.init({
        callback: (summary) => {
          state.summary = summary;
          pushStatus();
        },
      });
      console.log('rum-torrent up');
    }

    await torrent.seed(param.seed);
    console.log('add new seed');

    // TODO: detect duplicate torrent
    // // eslint-disable-next-line import/extensions
    // const parseTorrent = await import('parse-torrent/index.js');
    // const newTorrent = parseTorrent.default(param.seed);
    // const client: any = torrent.getClient({});
    // if (!client.torrents || client.torrents.some((v: any) => v.infoHash === newTorrent.infoHash)) {
    //   try {
    //     await torrent.seed(param.seed);
    //     console.log('add new seed');
    //   } catch (e) {}
    // }

    pushStatus();
  },
  down: async () => {
    // TODO ignore request while up or down
    if (!state.up) { return; }
    await torrent.end();
    state.up = false;
    console.log('rum-torrent down');
    pushStatus();
  },
  status: () => ({
    up: state.up,
    summary: state.summary,
  }),
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
