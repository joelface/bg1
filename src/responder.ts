type BootstrapEvent = MessageEvent<{
  event: string;
}>;

const events: {
  [event: string]: ((event: BootstrapEvent) => void) | undefined;
} = {
  'comm-bootstrap-start': event => {
    (event.source as WindowProxy).postMessage(
      {
        event: 'comm-bootstrap-ack',
        targetName: 'responder',
      },
      '*'
    );
  },
  'comm-bootstrap-data': event => {
    event.ports[0].onmessage = function (event: MessageEvent) {
      const { id, type, name } = event.data ?? {};
      if (type === 'CALL') {
        this.postMessage({
          id,
          name,
          type: 'CALL_DONE',
          status: 'resolved',
          data: null,
        });
      }
    };
  },
};

addEventListener('message', (event: MessageEvent) => {
  events[event.data.event]?.(event);
});
