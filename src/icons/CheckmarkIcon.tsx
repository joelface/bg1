import Icon from './Icon';

/**
 * Checkmark icon from [IcoMoon]{@link https://icomoon.io/#icons-icomoon}
 * @license CC-BY-4.0
 */
export default function CheckmarkIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M13.5 2l-7.5 7.5-3.5-3.5-2.5 2.5 6 6 10-10z" />
    </Icon>
  );
}
