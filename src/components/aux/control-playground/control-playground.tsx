import { useControl } from "@/hooks/control/control";

const change = (v: boolean) => (v ? "true" : "false");

export const ControlPlayground = () => {
  const { control, ...extra } = useControl();

  const { a, b, down, left, right, up, start, select } = control;

  return (
    <main
      data-testid="main"
      className="w-screen h-screen flex justify-center items-center"
      {...extra}
    >
      <ul>
        <li data-testid="a">a: {change(a)}</li>
        <li data-testid="b">b: {change(b)}</li>
        <li data-testid="down">down: {change(down)}</li>
        <li data-testid="left">left: {change(left)}</li>
        <li data-testid="right">right: {change(right)}</li>
        <li data-testid="up">up: {change(up)}</li>
        <li data-testid="start">start: {change(start)}</li>
        <li data-testid="select">select: {change(select)}</li>
      </ul>
    </main>
  );
};
