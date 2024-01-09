import { Children } from "../children/children";

const Container = ({ children }: Children) => {
  return <div className="mx-auto my-0 w-10/12 md:max-w-5xl">{children}</div>;
};

export { Container };
