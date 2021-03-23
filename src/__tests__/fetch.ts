import { fetchJson } from '../fetch';

const fetchMock = jest.fn();
self.fetch = fetchMock;

describe('fetchJson()', () => {
  it('returns response', async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      json: () => ({ a: 1 }),
    });
    expect(await fetchJson('https://example.com/')).toEqual({
      status: 200,
      data: { a: 1 },
    });
  });
});
