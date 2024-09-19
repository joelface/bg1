import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useTheme } from '@/contexts/Theme';
import Icon from '@/icons/Icon';

import Button from './Button';
import Overlay from './Overlay';

export interface Option<V> {
  text: string;
  buttonText?: string;
  icon?: React.ReactNode;
  value?: V;
}

export interface MenuProps<K, V> {
  options: Map<K, Option<V>>;
  selected?: K;
  onChange: (value: V) => void;
}

export type MenuButtonProps<K, V> = Omit<
  Parameters<typeof Button>[0],
  'children' | 'selected' | 'onChange'
> &
  MenuProps<K, V> & {
    menuType: React.ComponentType<MenuProps<K, V>>;
  };

export default function MenuButton<K, V>(props: MenuButtonProps<K, V>) {
  const {
    options,
    selected,
    title,
    onChange,
    disabled,
    menuType: Menu,
    ...buttonProps
  } = props;
  const { bg } = useTheme();
  const [showingList, showList] = useState(false);
  const [minTextWidth, setMinTextWidth] = useState(0);
  const btnTextRef = useRef<HTMLSpanElement>(null);
  const menuContainerRef = useRef<HTMLFormElement>(null);

  // We don't want the button width to change every time a different option
  // is selected, so we have to find the largest width of all the options.
  useLayoutEffect(() => {
    if (options.values().next().value?.icon) return;
    const textElem = btnTextRef.current;
    const textNode = textElem?.firstChild;
    if (!textNode) return;
    const currentText = textNode.nodeValue;
    if (!currentText) return;
    let textWidth = 0;
    for (const opt of options.values()) {
      textNode.nodeValue = opt.buttonText ?? opt.text;
      textWidth = Math.max(textElem.offsetWidth, textWidth);
    }
    textNode.nodeValue = currentText;
    setMinTextWidth(textWidth);
  }, [options]);

  const selectedInput = () =>
    menuContainerRef.current?.querySelector(
      'input:checked'
    ) as HTMLInputElement | null;

  useEffect(() => {
    if (!showingList) return;
    const sel = selectedInput();
    sel?.closest('li')?.scrollIntoView({ block: 'center' });
    sel?.focus();
    const onFocus = (event: FocusEvent) => {
      if (!menuContainerRef.current?.contains(event.target as Element)) {
        showList(false);
      }
    };
    addEventListener('focusin', onFocus);
    return () => removeEventListener('focusin', onFocus);
  }, [showingList]);

  const changeValue = () => {
    const input = selectedInput();
    if (input) {
      const k = input.value as K;
      const opt = options.get(k);
      if (opt) onChange(opt.value ?? (k as unknown as V));
    }
    showList(false);
  };
  const opt = selected
    ? options.get(selected)
    : title !== undefined
      ? { text: title }
      : undefined;
  if (!opt) return null;
  const { icon, text, buttonText } = opt;
  let arrowPressed = false;

  return (
    <>
      <Button
        {...buttonProps}
        title={title}
        aria-label={icon ? text : undefined}
        disabled={disabled || options.size === 0}
        onClick={() => showList(true)}
      >
        {icon ? (
          icon
        ) : (
          <span
            className="flex-1 truncate"
            style={{ minWidth: `${minTextWidth}px` }}
            ref={btnTextRef}
          >
            {buttonText ?? text}
          </span>
        )}
        <Icon className="w-2.5 ml-2 shrink-0">
          <path d="m6.8273 12.401-5.6333-7.7812a1.0212 1.0212 117.05 0 1 0.82716-1.62l11.958-2e-7a1.0212 1.0212 62.952 0 1 0.82714 1.62l-1.6438 2.2705a79984 79984 125.9 0 0-2.3456 3.2401l-1.6437 2.2706a1.4479 1.4479 180 0 1-2.3456 4.4e-5z" />
        </Icon>
      </Button>
      {showingList && (
        <Overlay
          onChange={() => {
            if (!arrowPressed) changeValue();
            arrowPressed = false;
          }}
          onClick={event => {
            if (arrowPressed) return;
            if (!menuContainerRef.current?.contains(event.target as Element)) {
              showList(false);
            } else if (event.target === selectedInput()) {
              showList(false);
              changeValue();
            }
          }}
          onKeyDown={({ key }) => {
            if (['Enter', ' '].includes(key)) {
              changeValue();
            } else if (key.startsWith('Arrow')) {
              arrowPressed = true;
            }
          }}
          data-testid="shade"
        >
          <div
            className={`flex flex-col min-w-[50%] max-h-[90%] rounded-lg bg-white text-black`}
          >
            {title && (
              <h3
                className={`mt-0 rounded-t-lg px-5 py-1 ${bg} text-white font-semibold text-center`}
              >
                {title}
              </h3>
            )}
            <form aria-label={`${title} Selection`} ref={menuContainerRef}>
              <Menu {...props} />
            </form>
          </div>
        </Overlay>
      )}
    </>
  );
}
