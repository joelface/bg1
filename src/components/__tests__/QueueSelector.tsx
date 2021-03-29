import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';

import { rotr, mtwr, queues } from '../../__fixtures__/vq';
import QueueSelector from '../QueueSelector';

const { getByDisplayValue } = screen;

describe('QueueSelector', () => {
  it('does not use <select> for a single queue', () => {
    const { container } = render(
      <QueueSelector queues={[rotr]} selected={rotr} onChange={() => null} />
    );
    expect(container).toHaveTextContent(rotr.name);
    expect(container.querySelector('select')).toBeNull();
  });

  it('uses <select> for multiple queues', () => {
    const onChange = jest.fn();
    render(
      <QueueSelector queues={queues} selected={mtwr} onChange={onChange} />
    );
    fireEvent.change(getByDisplayValue(mtwr.name), {
      target: { value: rotr.queueId },
    });
    expect(onChange).toHaveBeenCalledWith(rotr.queueId);
    expect(getByDisplayValue(rotr.name)).toBeInTheDocument();
  });
});
