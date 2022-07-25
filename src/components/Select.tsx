import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import Icon from '@/icons/Icon';
import Button from './Button';
import Overlay from './Overlay';

const RADIO_NAME = '_SELECT_RADIO_BUTTON_';

export interface Option<V extends string = string> {
  value: V;
  text: string;
  icon?: React.ReactNode;
}

type Props<V extends string> = Omit<
  Parameters<typeof Button>[0],
  'children' | 'value' | 'onChange'
> & {
  options: readonly Option<V>[];
  value: V;
  onChange: (value: V) => void;
  iconOnly?: boolean;
};

export default function Select<V extends string>(props: Props<V>) {
  const { options, value, onChange, ...buttonProps } = props;
  const [showingList, showList] = useState(false);
  const [minTextWidth, setMinTextWidth] = useState(0);
  const btnTextRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // We don't want the button width to change every time a different option
  // is selected, so we have to find the largest width of all the options.
  useLayoutEffect(() => {
    if (options[0]?.icon) return;
    const textElem = btnTextRef.current;
    const textNode = textElem?.firstChild;
    if (!textNode) return;
    const currentText = textNode.nodeValue;
    if (!currentText) return;
    let textWidth = 0;
    for (const opt of options) {
      textNode.nodeValue = opt.text;
      textWidth = Math.max(textElem.offsetWidth, textWidth);
    }
    textNode.nodeValue = currentText;
    setMinTextWidth(textWidth);
  }, [options]);

  const selectedInput = () =>
    listRef.current?.querySelector('input:checked') as HTMLInputElement | null;

  useEffect(() => {
    if (!showingList) return;
    selectedInput()?.focus();
    const onFocus = (event: FocusEvent) => {
      if (!listRef.current?.contains(event.target as Element)) showList(false);
    };
    addEventListener('focusin', onFocus);
    return () => removeEventListener('focusin', onFocus);
  }, [showingList]);

  const changeValue = () => {
    const input = selectedInput();
    if (input) onChange(input.value as V);
    showList(false);
  };
  const { icon, text } = options.find(opt => opt.value === value) || options[0];
  let arrowPressed = false;

  return (
    <>
      <Button {...buttonProps} onClick={() => showList(true)}>
        {icon ? (
          icon
        ) : (
          <span style={{ minWidth: `${minTextWidth}px` }} ref={btnTextRef}>
            {text}
          </span>
        )}
        <Icon className="w-2.5 ml-2">
          <path d="m6.8273 12.401-5.6333-7.7812a1.0212 1.0212 117.05 0 1 0.82716-1.62l11.958-2e-7a1.0212 1.0212 62.952 0 1 0.82714 1.62l-1.6438 2.2705a79984 79984 125.9 0 0-2.3456 3.2401l-1.6437 2.2706a1.4479 1.4479 180 0 1-2.3456 4.4e-5z" />
        </Icon>
      </Button>
      {showingList && (
        <Overlay
          className={{
            outer: 'z-10 bg-black bg-opacity-75',
            inner: 'flex items-center justify-center h-full',
          }}
          onClick={event => {
            const target = event.target as Element;
            if (!listRef.current?.contains(target)) return showList(false);
            if (target.tagName === 'INPUT' && !arrowPressed) {
              return changeValue();
            }
            arrowPressed = false;
          }}
          onKeyDown={({ key }) => {
            if (['Enter', ' '].includes(key)) {
              changeValue();
            } else if (key.startsWith('Arrow')) {
              arrowPressed = true;
            }
          }}
          data-testid="select-shade"
        >
          <ul
            className="overflow-auto min-w-[50%] max-h-[90%] rounded-lg bg-white text-black"
            ref={listRef}
          >
            {options.map(opt => {
              return (
                <li
                  className="border-t-2 first:border-0 border-gray-300"
                  key={opt.value}
                >
                  <label className="flex flex-row items-center px-4 py-3">
                    <input
                      type="radio"
                      name={RADIO_NAME}
                      defaultChecked={opt.value === value}
                      value={opt.value}
                      className="w-4 h-4 mr-2.5"
                    />{' '}
                    {opt.icon && (
                      <span aria-hidden="true" className="mr-2.5">
                        {opt.icon}
                      </span>
                    )}{' '}
                    {opt.text}
                  </label>
                </li>
              );
            })}
          </ul>
        </Overlay>
      )}
    </>
  );
}
