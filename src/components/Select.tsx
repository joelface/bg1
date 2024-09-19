import MenuButton, { MenuButtonProps, MenuProps } from './MenuButton';

export default function Select<K extends string, V = K>(
  props: Omit<MenuButtonProps<K, V>, 'menuType'>
) {
  return <MenuButton {...props} menuType={SelectMenu} />;
}

export function SelectMenu<K extends string, V = K>(props: MenuProps<K, V>) {
  const { options, selected } = props;
  return (
    <ul className="overflow-auto">
      {[...options].map(([k, opt]) => {
        return (
          <li
            className="border-t-2 first:border-0 border-gray-300"
            key={opt.text}
          >
            <label className="flex flex-row items-center gap-x-2.5 px-4 py-3">
              <input
                type="radio"
                name="_SELECT_RADIO_BUTTON_"
                value={k}
                defaultChecked={k === selected}
                className="w-4 h-4 shrink-0"
              />{' '}
              {opt.icon && <span aria-hidden="true">{opt.icon}</span>}{' '}
              {opt.text}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
