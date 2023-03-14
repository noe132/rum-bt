import React from 'react';
import { ThemeRoot } from 'utils/theme';
import { rumTorrentIPC } from 'utils/rumTorrentIPC';
import { loadInspect } from 'utils/inspect';
import { TitleBar } from './TitleBar';
import { MainView } from './Main';

export const App = () => {
  React.useEffect(() => rumTorrentIPC.init(), []);
  React.useEffect(() => loadInspect(), []);

  return (
    <ThemeRoot>
      <div className="flex flex-col h-screen w-screen">
        <TitleBar />
        <MainView />
      </div>
    </ThemeRoot>
  );
};
