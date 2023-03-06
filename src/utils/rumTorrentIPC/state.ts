import { observable, reaction } from 'mobx';
import type { Summary } from 'rum-torrent';

export const state = observable({
  up: false,
  summary: null as null | Summary,
});

reaction(
  () => state.up,
  () => {
    if (!state.up) {
      state.summary = null;
    }
  },
);
