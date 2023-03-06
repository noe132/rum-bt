import React, { useRef } from 'react';
import { action } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Button, TextField } from '@mui/material';

import { rumTorrentIPC } from 'utils/rumTorrentIPC';

export const MainView = observer(() => {
  const state = useLocalObservable(() => ({
    seed: 'magnet:?xt=urn:btih:84fdd33834ef193830389a773336e097b9d67d80&dn=192.mp4&tr=http%3A%2F%2F127.0.0.1%3A8965%2Fannounce%2F3ee1703edf6efee57284cdf438b7e95cf7014df7c4f8cc37aaba8ba174773eed',
    opened: false,
    playing: '',
    get torrent() {
      return rumTorrentIPC.state;
    },
    get files() {
      return this.torrent.summary?.torrents.flatMap((v) => v.files) ?? [];
    },
  }));
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSeed = async () => {
    await rumTorrentIPC.up(state.seed);
  };

  const handleDown = async () => {
    await rumTorrentIPC.down();
  };

  const handlePlay = (url: string) => {
    state.playing = url;
  };

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.1;
    }
  }, [state.playing]);

  return (
    <div className="flex flex-center flex-1 h-0 relative">
      {!state.torrent.up && (
        <div className="flex flex-center">
          <TextField
            value={state.seed}
            onChange={action((e) => { state.seed = e.target.value; })}
            multiline
          />
          <Button
            color="primary"
            variant="outlined"
            onClick={handleSeed}
          >
            Seed
          </Button>
        </div>
      )}

      {!state.playing && !!state.torrent.up && (
        <div className="flex-col flex-center gap-1">
          <div className="flex flex-center">
            <Button
              color="primary"
              variant="outlined"
              onClick={handleDown}
            >
              Down
            </Button>
          </div>
          {!!state.files.length && (
            <div className="flex-col">
              {state.files.map((v, i) => (
                <Button
                  className="normal-case"
                  variant="outlined"
                  key={i}
                  onClick={() => handlePlay(v)}
                >
                  {v}
                </Button>
              ))}
            </div>
          )}
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
            className="absolute top-0 left-0 z-10"
            onClick={action(() => { state.playing = ''; })}
          >
            Back
          </Button>
        </div>
      )}
    </div>
  );
});
