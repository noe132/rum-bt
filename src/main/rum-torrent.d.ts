declare module 'rum-torrent' {
  import { WebTorrent } from 'webtorrent';

  export interface Summary {
    peerId: WebTorrent['peerId']
    nodeId: WebTorrent['nodeId']
    client: {
      client: any
      version: any
    }
    externalIp: any
    dhtPort: any
    dhtNatUpnp: any
    torrentPort: any
    torrentNatUpnp: any
    httpPort: any
    torrents: Array<{
      status: string
      name: any
      infoHash: any
      torrent: any
      magnet: any
      speed: string
      path: any
      downloaded: string
      uploaded: string
      runningTime: string
      timeRemaining: string
      trackers: any
      peers: string
      queuedPeers: any
      blockedPeers: any
      hotswaps: any
      files: Array<string>
      wires: Array<string>
    }>
  }

  interface InitOptions {
    callback?: (summary: Summary) => unknown
    verbose?: boolean
  }

  const config: any;
  const dashboard: any;
  const natUpnp: any;
  const torrent: {
    createTorrent: any
    end: () => Promise<void>
    getClient: (options: any) => WebTorrent
    init: (options: InitOptions) => Promise<void>
    parseTorrent: any
    seed: (input: string, options?: any) => Promise<WebTorrent>
    toMagnetURI: any
  };
  const tracker: any;
  export { config, dashboard, natUpnp, torrent, tracker };
}
