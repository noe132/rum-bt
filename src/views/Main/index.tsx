import React, { useRef } from 'react';
import { action, reaction, runInAction } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Button, TextField } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';

import { rumTorrentIPC } from 'utils/rumTorrentIPC';
import { torrent } from 'service';

const SEED_STORAGE_KEY = 'SEED_STORAGE_KEY';
export const MainView = observer(() => {
  const state = useLocalObservable(() => ({
    seed: '',
    playing: '',
    get up() {
      return rumTorrentIPC.state.up;
    },
    get torrents() {
      return torrent.state.summary?.torrents ?? [];
    },
    get files() {
      return this.torrents.flatMap((v) => v.files) ?? [];
    },
  }));
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSeed = async () => {
    if (state.seed) {
      await torrent.up(state.seed);
    }
  };

  const handleDown = async () => {
    await torrent.down();
  };

  const handlePlay = (url: string) => {
    state.playing = url;
  };

  React.useEffect(() => {
    runInAction(() => {
      state.seed = window.localStorage.getItem(SEED_STORAGE_KEY) ?? '';
    });
    const dispose = reaction(
      () => state.seed,
      () => {
        window.localStorage.setItem(SEED_STORAGE_KEY, state.seed);
      },
    );
    return dispose;
  }, []);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.5;
    }
  }, [state.playing]);

  return (
    <div className="flex flex-center flex-1 h-0 relative">
      {!state.playing && (
        <div className="flex-col flex-center gap-4">
          <div className="flex-col flex-center gap-4">
            <TextField
              className="w-80 break-all"
              value={state.seed}
              onChange={action((e) => { state.seed = e.target.value; })}
              multiline
              placeholder="Paste seed here"
              rows={8}
            />
            <Button
              className="w-full"
              color="primary"
              variant="outlined"
              onClick={handleSeed}
            >
              Start / Add Seed
            </Button>
          </div>

          <div className="flex flex-center">
            {!!state.up && (
              <Button
                color="primary"
                variant="outlined"
                onClick={handleDown}
              >
                Down
              </Button>
            )}
          </div>
          <div className="flex-col gap-4">
            {state.torrents.map((t, ti) => (<>
              <div className="grid grid-cols-2 gap-x-4" key={ti}>
                <div className="text-right">seed: </div>
                <div className="truncate max-w-[200px]">{t.magnet}</div>
                <div className="text-right">uploaded: </div>
                <div>{t.uploaded}</div>
                <div className="text-right">downloaded: </div>
                <div>{t.downloaded}</div>
                <div className="text-right">speed: </div>
                <div>{t.speed}</div>
                <div className="text-right">peers: </div>
                <div>{t.peers}</div>
                <div className="text-right">runningTime: </div>
                <div>{t.runningTime}</div>
              </div>
              {t.files.map((v, i) => (
                <Button
                  className="normal-case"
                  variant="outlined"
                  key={i}
                  onClick={() => handlePlay(v)}
                >
                  {v}
                </Button>
              ))}
            </>))}
          </div>
        </div>
      )}

      {state.playing && (
        <div className="flex flex-center flex-1 h-full w-0 relative">
          <video
            className="max-h-[100%] max-w-[100%]"
            controls
            ref={videoRef}
            autoPlay
            loop
          >
            <source src={state.playing} type="video/mp4" />
          </video>
          <Button
            className="absolute top-2 left-2 z-10"
            variant="contained"
            color="primary"
            onClick={action(() => { state.playing = ''; })}
          >
            <ChevronLeft />
            Back
          </Button>
        </div>
      )}
    </div>
  );
});
