import { waitFor } from '/testing';
import { AuthClient } from '../client';

const ipm = jest.fn();
const iframe = {
  src: '',
  contentWindow: {
    postMessage: ipm,
  } as unknown,
} as HTMLIFrameElement;
const onLogin = jest.fn();
jest.spyOn(console, 'log').mockImplementation();

const addEventListener = self.addEventListener;
jest
  .spyOn(self, 'addEventListener')
  .mockImplementation(
    (type: string, listener: EventListenerOrEventListenerObject) => {
      if (type === 'message' && typeof listener === 'function') {
        addEventListener('message', (event: MessageEvent) => {
          listener({
            data: event.data,
            source: event.source || iframe.contentWindow,
          } as MessageEvent);
        });
      } else {
        addEventListener(type, listener);
      }
    }
  );

const removeEventListener = jest.fn();
self.removeEventListener = removeEventListener;

function send(message: any) {
  message =
    typeof message === 'object'
      ? JSON.stringify({
          ...message,
          name: 'lightbox-main-frame',
        })
      : message;
  self.postMessage(message, '*');
}

function messages() {
  const messages = ipm.mock.calls.map(args => {
    const message = JSON.parse(args[0]);
    delete message.name;
    return message;
  });
  ipm.mockClear();
  return messages;
}

function loadClient(logging?: boolean) {
  const client = new AuthClient(iframe, onLogin, 'WDW', logging);
  client.open();
  expect(iframe.src.startsWith('https://cdn.registerdisney.go.com/')).toBe(
    true
  );
  send({ type: 'handshake' });
  return client;
}

describe('AuthClient', () => {
  it('properly responds to messages', async () => {
    const client = loadClient();
    expect(self.addEventListener).toBeCalledTimes(1);
    // The next three messages should be ignored
    send({ type: 'handshake' });
    send('inner.loaded');
    self.dispatchEvent(new MessageEvent('message', { source: self }));

    await waitFor(() =>
      expect(messages()).toEqual([
        { type: 'handshakeAck' },
        {
          type: 'message',
          eventName: 'workflow.execute',
          data: { name: 'login' },
        },
      ])
    );

    const deferredUuid = 'ad1f6ef5-acdf-47ca-ad5d-3d3fcf829b4f';
    send({
      type: 'message',
      eventName: 'session.deviceId.read',
      data: { loginValue: 'joel@example.com' },
      deferredUuid,
    });
    await waitFor(() =>
      expect(messages()).toEqual([
        {
          type: 'deferred',
          action: 'resolve',
          data: {},
          deferredUuid,
        },
      ])
    );

    const token = {
      swid: '{MICKEY}',
      access_token: 'm1ck3y',
      exp: new Date('2121-12-21T12:21:12Z').getTime(),
    };
    send({
      type: 'message',
      eventName: 'session.loggedin',
      data: { token },
      deferredUuid: 'd0b1e8eb-946d-4d79-a08c-60e870ce35b5',
    });
    await waitFor(() =>
      expect(onLogin).lastCalledWith({
        swid: token.swid,
        accessToken: token.access_token,
        expires: new Date(token.exp),
      })
    );

    send({ type: 'message', eventName: 'lightbox.hide' });
    await waitFor(() => expect(self.addEventListener).toBeCalledTimes(2));

    expect(removeEventListener).not.toBeCalled();
    client.close();
    expect(removeEventListener.mock.calls[0][0]).toBe('message');
  });

  it('enables logging when set in constructor', async () => {
    loadClient(true);
    await waitFor(() =>
      expect(messages()).toContainEqual({
        type: 'message',
        eventName: 'setLogLevel',
        data: { level: 'log' },
      })
    );
    expect(console.log).toBeCalled();
  });
});
