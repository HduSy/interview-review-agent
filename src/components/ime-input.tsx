"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Controlled text input that survives IME composition.
 *
 * Background: a controlled `<input>` whose `value` is set from an async
 * store (Dexie put → set) races with the browser's IME composition state.
 * When the parent re-renders mid-composition and writes back an earlier
 * value, the IME's intermediate buffer ("sh" for Pinyin) is interrupted —
 * the user sees Latin letters instead of Chinese candidates.
 *
 * Strategy: hold a local mirror of `value`. While the IME is composing,
 * external updates are ignored and onChange isn't fired. On compositionEnd
 * (or non-composing keystrokes for ASCII / paste), we commit upward.
 */
export const ImeInput = forwardRef<HTMLInputElement, Props>(function ImeInput(
  { value, onChange, onKeyDown, ...rest },
  forwardedRef,
) {
  const [local, setLocal] = useState(value);
  const composingRef = useRef(false);
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(forwardedRef, () => innerRef.current as HTMLInputElement);

  // Pull in external updates only when we're not mid-composition. This
  // means a parent re-render during IME input is silently swallowed by
  // the local state — the user keeps typing.
  useEffect(() => {
    if (!composingRef.current && value !== local) {
      setLocal(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      {...rest}
      ref={innerRef}
      value={local}
      onChange={(e) => {
        const v = e.target.value;
        setLocal(v);
        // During composition we never propagate — the buffer holds Pinyin
        // letters that aren't real input yet.
        if (!composingRef.current) onChange(v);
      }}
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onCompositionEnd={(e) => {
        composingRef.current = false;
        const v = (e.target as HTMLInputElement).value;
        setLocal(v);
        onChange(v);
      }}
      onKeyDown={(e) => {
        // IME Enter (confirming a candidate) must not trigger any
        // submit-on-Enter logic in the caller's onKeyDown.
        if (e.nativeEvent.isComposing || e.keyCode === 229) {
          return;
        }
        onKeyDown?.(e);
      }}
    />
  );
});
