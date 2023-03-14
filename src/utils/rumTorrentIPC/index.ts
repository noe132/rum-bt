import { Summary } from 'rum-torrent';
import { sendRequest, initTorrentIPC } from './request';
import { state } from './state';

const up = (seed: string) => sendRequest({
  action: 'up',
  param: { seed },
});

const down = () => sendRequest({
  action: 'down',
});

const status = () => sendRequest<{ up: boolean, summary: Summary }>({
  action: 'status',
});

const init = () => {
  const dispose = initTorrentIPC();
  status().then((data) => {
    console.log(data);
    state.up = data.data.up;
    state.summary = data.data.summary;
  });
  return dispose;
};

export const rumTorrentIPC = {
  state,
  up,
  down,
  status,
  init,
};
