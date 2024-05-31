import { Dictionary } from "@/nes/helper/dictionary";
import { KeyboardEvent, useState } from "react";

type ControlGeneric<T> = {
  up: T;
  left: T;
  right: T;
  down: T;
  a: T;
  b: T;
  start: T;
  select: T;
};

export type Control = ControlGeneric<boolean>;

type ControlMap = ControlGeneric<string>;

const controlMap: ControlMap = {
  up: "w",
  left: "a",
  right: "d",
  down: "s",
  a: "j",
  b: "k",
  start: "n",
  select: "m",
};

const revertObject = (obj: Dictionary<string, string>) => {
  const keys = Object.keys(obj);
  return keys.reduce((acc, curr) => {
    return { ...acc, [obj[curr]]: curr };
  }, {} as Dictionary<string, string>);
};

const useControl = () => {
  const reverseMap = revertObject(controlMap);
  const [control, setControl] = useState<Control>({
    a: false,
    b: false,
    down: false,
    left: false,
    right: false,
    up: false,
    select: false,
    start: false,
  });
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const key = reverseMap[e.key];
    if (!key) return;
    setControl((cont) => ({ ...cont, [key]: true }));
  };

  const onKeyUp = (e: KeyboardEvent<HTMLElement>) => {
    const key = reverseMap[e.key];
    if (!key) return;
    setControl((cont) => ({ ...cont, [key]: false }));
  };

  return { onKeyDown, onKeyUp, tabIndex: 0, control };
};

export { useControl };
