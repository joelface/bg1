import * as timeIs from '../time-is';

const init = jest.fn();
self.time_is_widget = { init };

afterEach(() => timeIs.clear());

describe('add()', () => {
  it('loads script and inits', () => {
    timeIs.add('_z161');
    expect(document.scripts[0].src).toBe('https://widget.time.is/t.js');
    expect(init).toHaveBeenLastCalledWith({ _z161: {} });
  });

  it('only loads script once', () => {
    timeIs.add('_z161');
    timeIs.add('_z14e');
    expect(document.scripts.length).toBe(1);
    expect(init).toHaveBeenLastCalledWith({ _z161: {}, _z14e: {} });
  });
});

describe('remove()', () => {
  it('removes widget', () => {
    timeIs.add('_z161');
    timeIs.add('_z14e');
    timeIs.remove('_z161');
    expect(init).toHaveBeenLastCalledWith({ _z14e: {} });
  });
});

describe('clear()', () => {
  it('removes all widgets', () => {
    timeIs.add('_z161');
    timeIs.add('_z14e');
    timeIs.clear();
    expect(init).toHaveBeenLastCalledWith({});
  });
});
