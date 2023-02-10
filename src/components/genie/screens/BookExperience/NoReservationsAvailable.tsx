import PartyList from './PartyList';

export default function NoReservationsAvailable({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <>
      <h3>No Reservations Available</h3>
      <p>
        There aren't enough reservation slots available for your entire party.
        If only part of your group wishes to go on this attraction, edit your
        party to check again. Otherwise, go back to the tip board and select
        another attraction.
      </p>
      <PartyList buttonText="Back" onSubmit={onClose} />
    </>
  );
}
