import * as timeIs from '../time-is';

const init = jest.fn();
self.time_is_widget = { init };

describe('add()', () => {
  it('loads script and inits', () => {
    timeIs.add('Orlando_z161');
    expect(document.scripts[0].src).toBe('https://widget.time.is/t.js');
    expect(init).lastCalledWith({ Orlando_z161: {} });
  });

  it('only loads script once', () => {
    timeIs.add('Orlando_z161');
    timeIs.add('Anaheim_z14e');
    expect(document.scripts.length).toBe(1);
    expect(init).lastCalledWith({ Orlando_z161: {}, Anaheim_z14e: {} });
  });
});
