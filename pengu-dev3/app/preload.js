const { contextBridge, ipcRenderer } = require('electron');

const INVOKE_CHANNELS = new Set([
  'pet:list-animations',
  'pet:move-by',
  'pet:chat',
  'pet:transcribe'
]);

const SEND_CHANNELS = new Set([
  'pet:drag-start',
  'pet:drag-move',
  'pet:drag-end',
  'pet:clicked',
  'pet:set-interactive'
]);

const RECEIVE_CHANNELS = new Set([
  'pet:system-idle',
  'pet:state',
  'pet:say'
]);

contextBridge.exposeInMainWorld('pengu', {
  invoke: (channel, payload = {}) => {
    if (INVOKE_CHANNELS.has(channel)) {
      return ipcRenderer.invoke(channel, payload);
    }
    return Promise.reject(new Error(`[pengu preload] Unknown invoke channel: ${channel}`));
  },

  send: (channel, payload = {}) => {
    if (SEND_CHANNELS.has(channel)) {
      ipcRenderer.send(channel, payload);
    } else {
      console.warn(`[pengu preload] Unknown send channel: ${channel}`);
    }
  },

  on: (channel, callback) => {
    if (RECEIVE_CHANNELS.has(channel)) {
      ipcRenderer.on(channel, (_event, payload) => {
        try {
          callback(payload);
        } catch (err) {
          console.error(`[pengu preload] Error in listener for ${channel}:`, err);
        }
      });
    } else {
      console.warn(`[pengu preload] Unknown receive channel: ${channel}`);
    }
  },

  hasChannel: (channel) => {
    return INVOKE_CHANNELS.has(channel) ||
      SEND_CHANNELS.has(channel) ||
      RECEIVE_CHANNELS.has(channel);
  }
});
