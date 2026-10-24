const { contextBridge, ipcRenderer } = require('electron');

const INVOKE_CHANNELS = new Set([
  'pet:list-animations',
  'pet:move-by',
  'pet:chat',
  'pet:transcribe',
  'dash:get-user',
  'dash:get-courses',
  'dash:start-course',
  'dash:get-progress',
]);

const SEND_CHANNELS = new Set([
  'pet:drag-start',
  'pet:drag-move',
  'pet:drag-end',
  'pet:clicked',
  'pet:set-interactive',
  'dash:open-external',
]);

const ON_CHANNELS = new Set([
  'pet:say',
  'pet:state',
  'pet:system-idle',
  'dash:progress-updated',
]);

contextBridge.exposeInMainWorld('pengu', {
  invoke(channel, payload) {
    if (!INVOKE_CHANNELS.has(channel)) {
      return Promise.reject(new Error('Unknown channel'));
    }
    return ipcRenderer.invoke(channel, payload === undefined ? {} : payload);
  },
  send(channel, payload) {
    if (!SEND_CHANNELS.has(channel)) return;
    ipcRenderer.send(channel, payload === undefined ? {} : payload);
  },
  on(channel, callback) {
    if (!ON_CHANNELS.has(channel) || typeof callback !== 'function') return function () {};
    const listener = (_event, data) => callback(data);
    ipcRenderer.on(channel, listener);
    return function () {
      ipcRenderer.removeListener(channel, listener);
    };
  },
});
