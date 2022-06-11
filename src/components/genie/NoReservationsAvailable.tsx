import FloatingButton from '../FloatingButton';

export default function NoReservationsAvailable({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <>
      <h3>No Reservations Available</h3>
      <p>
        Tap the refresh button above to try again or go back to the tip board
        and select another attraction.
      </p>
      <FloatingButton onClick={onClose}>Back</FloatingButton>
    </>
  );
}
