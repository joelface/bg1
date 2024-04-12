const BUILD_ID = '181874e5af6';

export interface AuthData {
  swid: string;
  accessToken: string;
  expires: number;
}

interface PartialMessage {
  eventName: string;
  data: unknown;
  deferredUuid?: string;
}

interface Message extends PartialMessage {
  type: 'message';
}

interface DeferrableMessage extends Message {
  deferredUuid: string;
}

interface Deferred {
  type: 'deferred';
  deferredUuid: string;
  action: 'resolve' | 'reject';
  data: unknown;
}

interface Handshake {
  type: 'handshake';
}

interface HandshakeAck {
  type: 'handshakeAck';
}

type Sendable = Message | Deferred | Handshake | HandshakeAck;

type SendableHandler = (data: any) => unknown;

function isDeferrable(sendable: Sendable): sendable is DeferrableMessage {
  return 'deferredUuid' in sendable && sendable.deferredUuid !== undefined;
}

export class AuthClient {
  protected handlers: { [typeOrEventName: string]: SendableHandler } = {};
  protected handshakeAcked = false;

  constructor(
    protected iframe: HTMLIFrameElement,
    onLogin: (data: AuthData) => void,
    protected resort: 'WDW' | 'DLR',
    protected logging = false
  ) {
    this.on('handshake', () => {
      if (this.handshakeAcked) return;
      this.handshakeAcked = true;
      this.send({ type: 'handshakeAck' });
      if (this.logging) this.sendMessage('setLogLevel', { level: 'log' });
      this.sendMessage('workflow.execute', { name: 'login' });
    });
    this.on('lightbox.hide', () => this.open());
    // The "session.dateOfBirth.read" message is sent during the
    // registration process, which we don't want people to do using this.
    this.on('session.dateOfBirth.read', () => this.open());
    this.on('session.loggedin', ({ token }) => {
      onLogin({
        swid: token.swid,
        accessToken: token.access_token,
        expires: token.exp,
      });
    });
  }

  open(): void {
    addEventListener('message', this.onMessage);
    this.iframe.src = this.authPageUrl;
    this.handshakeAcked = false;
  }

  close(): void {
    removeEventListener('message', this.onMessage);
  }

  on(typeOrEventName: string, handler: SendableHandler): void {
    this.handlers[typeOrEventName] = handler;
  }

  sendMessage(eventName: string, data: unknown): void {
    this.send({ type: 'message', eventName, data });
  }

  protected onMessage = (event: MessageEvent<any>): void => {
    if (event.source !== this.iframe.contentWindow) return;
    if (event.data === 'inner.loaded') return;
    const message = JSON.parse(event.data) as Sendable;
    if (this.logging) console.log('Message:', message);
    const name = message.type === 'message' ? message.eventName : message.type;
    const handler = this.handlers[name];
    const result = handler
      ? handler('data' in message ? message.data : null)
      : undefined;
    if (isDeferrable(message)) {
      this.send({
        type: 'deferred',
        action: 'resolve',
        deferredUuid: message.deferredUuid,
        data: result ?? {},
      });
    }
  };

  protected send(sendable: Sendable): void {
    this.iframe.contentWindow?.postMessage(
      JSON.stringify({
        ...sendable,
        name: 'lightbox-client-window',
      }),
      this.authPageUrl
    );
  }

  protected get authPageUrl() {
    return `https://cdn.registerdisney.go.com/v2/TPR-${this.resort}-LBSDK.IOS-PROD/en-US?include=l10n,config,html,js&buildId=${BUILD_ID}`;
  }
}
