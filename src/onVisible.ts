export default function onVisible(callback: () => void) {
  const onVisibilityChange = () => {
    if (!document.hidden) callback();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
