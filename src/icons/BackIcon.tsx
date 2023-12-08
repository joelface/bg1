import Icon, { IconProps } from './Icon';

/**
 * Modified arrow-left2 icon from [IcoMoon]{@link https://icomoon.io/#icons-icomoon}
 * @license CC-BY-4.0
 */
export default function BackIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M0.293,7.337L7.333,0.297C7.723,-0.093 8.357,-0.093 8.747,0.297C9.137,0.687 9.137,1.321 8.747,1.711L3.414,7.044L15,7.044C15.552,7.044 16,7.492 16,8.044C16,8.596 15.552,9.044 15,9.044L3.414,9.044L8.747,14.377C9.137,14.767 9.137,15.401 8.747,15.791C8.357,16.181 7.723,16.181 7.333,15.791L0.293,8.751C0.102,8.561 0,8.307 0,8.044C0,7.781 0.102,7.527 0.293,7.337Z" />
    </Icon>
  );
}
