import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';

import { rotr, mtwr, queues } from '../../__fixtures__/vq';
import QueueHeading from '../QueueHeading';

const { getByDisplayValue } = screen;

describe('QueueHeading', () => {
  it('does not use <select> for a single queue', () => {
    const { container } = render(<QueueHeading queue={rotr} />);
    expect(container).toHaveTextContent(rotr.name);
    expect(container.querySelector('select')).toBeNull();
  });

  it('uses <select> for multiple queues', () => {
    const onChange = jest.fn();
    render(<QueueHeading queue={mtwr} queues={queues} onChange={onChange} />);
    fireEvent.change(getByDisplayValue(mtwr.name), {
      target: { value: rotr.queueId },
    });
    expect(onChange).toHaveBeenCalledWith(rotr.queueId);
    expect(getByDisplayValue(rotr.name)).toBeInTheDocument();
  });
});
