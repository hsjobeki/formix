import { createSignal } from "@modular-forms/solid/dist/types/primitives";
import { For, Show, type JSX } from "solid-js";
import cx from "classnames";

interface ListFieldProps {
  value: string;
  inputProps?: JSX.InputHTMLAttributes<HTMLInputElement>;
  label: JSX.Element;
  altLabel?: JSX.Element;
  helperText?: JSX.Element;
  error?: string;
  required?: boolean;
  type?: string;
  inlineLabel?: JSX.Element;
  class?: string;
  adornment?: {
    position: "start" | "end";
    content: JSX.Element;
  };
  disabled?: boolean;
  placeholder?: string;
  Field: () => JSX.Element;
}
export const ListField = (props: ListFieldProps) => {
  const [rows, setRows] = createSignal([]);

  return (
    <label
      class={cx("form-control w-full", props.class)}
      aria-disabled={props.disabled}
    >
      <div class="label">
        <span
          class="label-text block"
          classList={{
            "after:ml-0.5 after:text-primary after:content-['*']":
              props.required,
          }}
        >
          {props.label}
        </span>
        <span class="label-text-alt block">{props.altLabel}</span>
      </div>
      {<For each={rows}>{(row) => <props.Field></props.Field>}</For>}

      <div class="label">
        {props.helperText && (
          <span class="label-text text-neutral">{props.helperText}</span>
        )}
        {props.error && (
          <span class="label-text-alt font-bold text-error">{props.error}</span>
        )}
      </div>
    </label>
  );
};
