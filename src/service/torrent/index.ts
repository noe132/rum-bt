import { observable, runInAction } from 'mobx';
import { rumTorrentIPC } from 'utils/rumTorrentIPC';

const state = observable({
  get up() {
    return rumTorrentIPC.state.up;
  },
  get summary() {
    return rumTorrentIPC.state.summary;
  },
});

const up = async (seed: string) => {
  await rumTorrentIPC.up(seed);
};

const down = async () => {
  await rumTorrentIPC.down();
  runInAction(() => {
    rumTorrentIPC.state.up = false;
  });
};

export const torrent = {
  state,

  up,
  down,
};
