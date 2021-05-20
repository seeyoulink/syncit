/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Transporter,
  TransporterEvents,
  TransporterEventHandler,
} from './base';

export class TlrTransporter<T> implements Transporter<T> {
  handlers: Record<TransporterEvents, Array<TransporterEventHandler>> = {
    [TransporterEvents.SourceReady]: [],
    [TransporterEvents.MirrorReady]: [],
    [TransporterEvents.Start]: [],
    [TransporterEvents.SendRecord]: [],
    [TransporterEvents.AckRecord]: [],
    [TransporterEvents.Stop]: [],
    [TransporterEvents.RemoteControl]: [],
  };
  
  tlr: any;
  username: string;

  constructor(options: { tlr: any, username: string }) {
    const { tlr, username } = options;
    this.tlr = tlr;
    this.username = username || '';
    
    const self = this;

    this.tlr.on('syncitmessage', (msg: any) => {
      if (
        msg.data === 'init_cobrowsing' ||
        msg.data === 'accepted_cobrowsing' ||
        msg.data === 'rejected_cobrowsing' ||
        msg.data === 'stop_cobrowsing' ||
        msg.data === 'cancel_cobrowsing'
      ) {
        return;
      }

      self.username = msg.user.username;
      const message = JSON.parse(msg.data);
      
      this.handlers[message.event as TransporterEvents].map(h => h({
        event: message.event,
        payload: message.payload,
      }));
    });
  }

  login() {
    return Promise.resolve(true);
  }

  setUsername(username: string) {
    this.username = username;
  }

  setItem(params: { event: TransporterEvents; payload?: unknown }) {
    const msgParams = {
      username: this.username,
      type: 'SYNCIT',
      data: JSON.stringify(params)
    };

    this.tlr.tools.sendPeerMessage(msgParams);
  }

  sendSourceReady() {
    this.setItem({
      event: TransporterEvents.SourceReady,
    });
    return Promise.resolve();
  }

  sendMirrorReady() {
    this.setItem({
      event: TransporterEvents.MirrorReady,
    });
    return Promise.resolve();
  }

  sendStart() {
    this.setItem({
      event: TransporterEvents.Start,
    });
    return Promise.resolve();
  }

  sendRecord(record: unknown) {
    this.setItem({
      event: TransporterEvents.SendRecord,
      payload: record,
    });
    return Promise.resolve();
  }

  ackRecord(id: number) {
    this.setItem({
      event: TransporterEvents.AckRecord,
      payload: id,
    });
    return Promise.resolve();
  }

  sendStop() {
    this.setItem({
      event: TransporterEvents.Stop,
    });
    return Promise.resolve();
  }

  sendRemoteControl(payload: unknown) {
    this.setItem({
      event: TransporterEvents.RemoteControl,
      payload,
    });
    return Promise.resolve();
  }

  on(event: TransporterEvents, handler: TransporterEventHandler) {
    this.handlers[event].push(handler);
  }
}
