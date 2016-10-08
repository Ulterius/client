# Ulterius Client

[![Join the chat at https://gitter.im/Ulterius/client](https://badges.gitter.im/Ulterius/client.svg)](https://gitter.im/Ulterius/client?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A web-based frontend for Ulterius Server. Written in Typescript using React, Alt and other assorted bits.

<img alt="screenshot" src="screenshot/screen.png" />

## Build Instructions
1. Clone repo
2. `npm install`
3. Rename the `config.ts.example` file in the src directory to `config.ts`. The options in it will affect your build, namely `autoConnect` which should be either an object with a `host` and `port` property that the client will automatically connect to, or just `false`; as well as `cachePassword` which if enabled, will automatically save your password and login on reconnect. There are two objects that are exported, one that's used for dev server builds, and another for production builds. 
    * By default, production has `{cachePassword: false, autoConnect: false}`.
    * By default, dev has `{cachePassword: true, autoConnect: true}`.
4. To launch an auto-reloading dev server, use `npm run dev`, or to generate a production build, `npm run build` and start up an http server in the `public` directory, or copy it wherever and do whatever you want with it. It should be perfectly static.