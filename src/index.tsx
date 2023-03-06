import React from 'react';
import { ipcRenderer } from 'electron';
import { createRoot } from 'react-dom/client';
import { configure } from 'mobx';
import { App } from './views';
import Log from 'utils/log';
import './styles/tailwind.sass';
import './styles/App.global.scss';

Log.setup();
ipcRenderer.setMaxListeners(20);

configure({
  enforceActions: 'never',
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
});

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
