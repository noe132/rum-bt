import { torrent } from './torrent';

export * from './torrent';

if (process.env.NODE_ENV === 'development') {
  const map = {
    torrent,
  };
  Object.entries(map).forEach(([k, v]) => {
    (window as any)[k] = v;
  });
}
