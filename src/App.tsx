import type { ParentProps } from "solid-js";
import { Toaster } from "./components/ui";

export default function App(props: ParentProps) {
  return (
    <>
      {props.children}
      <Toaster />
    </>
  );
}
