import { waitFor } from '@testing-library/preact';

import { AuthClient } from '../auth-client';

const ipm = jest.fn();
const iframe = {
  src: '',
  contentWindow: {
    postMessage: ipm,
  } as unknown,
} as HTMLIFrameElement;
const onLogin = jest.fn();

const origAddEventListener = self.addEventListener;
self.addEventListener = (
  type: string,
  listener: EventListenerOrEventListenerObject
) => {
  if (type === 'message' && typeof listener === 'function') {
    origAddEventListener('message', (event: MessageEvent) => {
      listener({
        data: event.data,
        source: iframe.contentWindow,
      } as MessageEvent);
    });
  } else {
    origAddEventListener(type, listener);
  }
};

const removeEventListener = jest.fn();
self.removeEventListener = removeEventListener;

const toJSON = JSON.stringify;

function send(message: any) {
  message.name = 'lightbox-main-frame';
  self.postMessage(toJSON(message), '*');
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

describe('AuthClient', () => {
  it('properly responds to messages', async () => {
    const client = new AuthClient(iframe, onLogin);
    client.open();
    expect(iframe.src.startsWith('https://cdn.registerdisney.go.com/')).toBe(
      true
    );

    send({ type: 'handshake' });
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
      access_token: 'm1ck3y',
      expires: '2121-12-21T12:21:12Z',
    };
    send({
      type: 'message',
      eventName: 'session.loggedin',
      data: { token },
      deferredUuid: 'd0b1e8eb-946d-4d79-a08c-60e870ce35b5',
    });
    await waitFor(() =>
      expect(onLogin).lastCalledWith(
        token.access_token,
        new Date(token.expires)
      )
    );

    expect(removeEventListener).not.toBeCalled();
    client.close();
    expect(removeEventListener.mock.calls[0][0]).toBe('message');
  });
});
