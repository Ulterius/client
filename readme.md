# Ulterius Client
A web-based frontend for Ulterius Server. Written in Typescript using React, Alt and other assorted bits.

<img alt="screenshot" src="screenshot/screen.png" />

## Build Instructions
1. Clone repo
2. `npm install`
3. Rename the `config.ts.example` file in the src directory to `config.ts`. The options in it will affect your build, namely `autoConnect` which should be either an object with a `host` and `port` property that the client will automatically connect to, or just `false`; as well as `cachePassword` which if enabled, will automatically save your password and login on reconnect. These options are mainly present in order to speed development and should both be turned off for production builds.
4. To launch an auto-reloading dev server, use `npm run dev`, or to generate a production build, `npm run build` and start up an http server in the `public` directory, or copy it wherever and do whatever you want with it. It should be perfectly static.