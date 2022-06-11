import Icon from './Icon';

/**
 * Star icon from [IcoMoon]{@link https://icomoon.io/#icons-icomoon}
 * @license CC-BY-4.0
 */
export default function StarIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M16 6.204l-5.528-0.803-2.472-5.009-2.472 5.009-5.528 0.803 4 3.899-0.944 5.505 4.944-2.599 4.944 2.599-0.944-5.505 4-3.899z" />
    </Icon>
  );
}
