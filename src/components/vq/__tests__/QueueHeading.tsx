import { fireEvent, render, screen } from '/testing';
import { rotr, mtwr, queues } from '/__fixtures__/vq';
import QueueHeading from '../QueueHeading';

describe('QueueHeading', () => {
  it('does not use <select> for a single queue', () => {
    render(<QueueHeading queue={rotr} />);
    screen.getByText(rotr.name);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('uses <select> for multiple queues', () => {
    const onChange = jest.fn();
    render(<QueueHeading queue={mtwr} queues={queues} onChange={onChange} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: rotr.id } });
    expect(onChange).lastCalledWith(rotr.id);
  });
});
