import { sendRequest, initTorrentIPC } from './request';
import { state } from './state';

export const up = (seed: string) => sendRequest({
  action: 'up',
  param: { seed },
});

export const down = () => sendRequest({
  action: 'down',
});

export const rumTorrentIPC = {
  state,
  up,
  down,
  initTorrentIPC,
};
