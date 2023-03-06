import { ipcRenderer, IpcRendererEvent } from 'electron';
import { state } from './state';

let id = 0;

const callbackQueueMap = new Map<number, (v: unknown) => unknown>();

export interface TorrentIPCRequest {
  action: string
  param?: any
  id: number
}

export interface TorrentIPCResult<T extends unknown> {
  id: number
  data: T
  error: string | null
}

export const sendRequest = <T extends unknown>(
  param: Pick<TorrentIPCRequest, Exclude<keyof TorrentIPCRequest, 'id'>>,
) => {
  id += 1;
  const requestId = id;
  let resolve: (v: unknown) => unknown = () => {};
  const promise = new Promise<unknown>((rs) => {
    resolve = rs;
  });
  callbackQueueMap.set(requestId, resolve);
  const data: TorrentIPCRequest = {
    ...param,
    id: requestId,
  };
  ipcRenderer.send('rum-torrent-ipc', data);
  return promise as Promise<TorrentIPCResult<T>>;
};

export const initTorrentIPC = () => {
  const handle = (_event: IpcRendererEvent, args: any) => {
    const id = args.id;
    if (!id) {
      return;
    }

    const callback = callbackQueueMap.get(id);
    if (!callback) {
      return;
    }

    callback(args);
    callbackQueueMap.delete(id);
  };

  const handleSummary = (_event: IpcRendererEvent, args: any) => {
    if (args.type === 'summary') {
      state.summary = args.data;
    }
    if (args.type === 'up') {
      state.up = args.data;
    }
  };

  ipcRenderer.on('rum-torrent-ipc', handle);
  ipcRenderer.on('rum-torrent-ipc-summary', handleSummary);

  return () => {
    ipcRenderer.off('rum-torrent-ipc', handle);
    ipcRenderer.off('rum-torrent-ipc-summary', handleSummary);
  };
};
