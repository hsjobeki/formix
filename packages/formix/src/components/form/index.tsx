import {
  createForm,
  Field,
  FieldArray,
  FieldElement,
  FieldValues,
  FormStore,
  getValue,
  minLength,
  pattern,
  ResponseData,
  setValue,
  getValues,
  insert,
  SubmitHandler,
  swap,
  reset,
  remove,
  move,
  setError,
} from "@modular-forms/solid";
import { JSONSchema7, JSONSchema7Type, validate } from "json-schema";
import { TextInput } from "../fields/TextInput";
import { Component, createEffect, For, JSX, Match, Switch } from "solid-js";
import cx from "classnames";

interface FormProps {
  schema: JSONSchema7;
  initialValues?: NonNullable<unknown>;
  handleSubmit?: SubmitHandler<NonNullable<unknown>>;
  initialPath?: string[];
  components?: {
    before?: JSX.Element;
    after?: JSX.Element;
  };
  readonly?: boolean;
  formProps?: JSX.InputHTMLAttributes<HTMLFormElement>;
}
export const Form = (props: FormProps) => {
  const [formStore, { Field, Form: ModuleForm }] = createForm({
    initialValues: props.initialValues,
  });

  const handleSubmit: SubmitHandler<NonNullable<unknown>> = async (
    values,
    event
  ) => {
    console.log("Submitting form values", values);
    props.handleSubmit?.(values, event);
  };

  return (
    <ModuleForm {...props.formProps} onSubmit={handleSubmit}>
      {props.components?.before}
      <SchemaFields
        schema={props.schema}
        Field={Field}
        formStore={formStore}
        path={props.initialPath || []}
        readonly={!!props.readonly}
      />
      {props.components?.after}
    </ModuleForm>
  );
};

interface UnsupportedProps {
  schema: JSONSchema7;
  error?: string;
}

const Unsupported = (props: UnsupportedProps) => (
  <div>
    {props.error && <div class="font-bold text-error">{props.error}</div>}
    <span>
      Invalid or unsupported schema entry of type:{" "}
      <b>{JSON.stringify(props.schema.type)}</b>
    </span>
    <pre>
      <code>{JSON.stringify(props.schema, null, 2)}</code>
    </pre>
  </div>
);

interface SchemaFieldsProps<T extends FieldValues, R extends ResponseData> {
  formStore: FormStore<T, R>;
  Field: typeof Field<T, R, never>;
  schema: JSONSchema7;
  path: string[];
  readonly: boolean;
}
export function SchemaFields<T extends FieldValues, R extends ResponseData>(
  props: SchemaFieldsProps<T, R>
) {
  return (
    <Switch fallback={<Unsupported schema={props.schema} />}>
      {/* Simple types */}
      <Match when={props.schema.type === "boolean"}>bool</Match>

      <Match when={props.schema.type === "integer"}>
        <StringField {...props} schema={props.schema} />
      </Match>
      <Match when={props.schema.type === "number"}>
        <StringField {...props} schema={props.schema} />
      </Match>
      <Match when={props.schema.type === "string"}>
        <StringField {...props} schema={props.schema} />
      </Match>
      {/* Composed types */}
      <Match when={props.schema.type === "array"}>
        <ArrayFields {...props} schema={props.schema} />
      </Match>
      <Match when={props.schema.type === "object"}>
        <ObjectFields {...props} schema={props.schema} />
      </Match>
      {/* Empty / Null */}
      <Match when={props.schema.type === "null"}>
        Dont know how to rendner InputType null
        <Unsupported schema={props.schema} />
      </Match>
    </Switch>
  );
}

export function StringField<T extends FieldValues, R extends ResponseData>(
  props: SchemaFieldsProps<T, R>
) {
  if (
    props.schema.type !== "string" &&
    props.schema.type !== "number" &&
    props.schema.type !== "integer"
  ) {
    return (
      <span class="text-error">
        Error cannot render the following as String input.
        <Unsupported schema={props.schema} />
      </span>
    );
  }
  const { Field } = props;

  const validate = props.schema.pattern
    ? pattern(
        new RegExp(props.schema.pattern),
        `String should follow pattern ${props.schema.pattern}`
      )
    : undefined;

  const commonProps = {
    label: props.schema.title || props.path.join("."),
  };
  const readonly = props.readonly;
  return (
    <Switch fallback={<Unsupported schema={props.schema} />}>
      <Match
        when={props.schema.type === "number" || props.schema.type === "integer"}
      >
        {(s) => (
          <Field
            // @ts-expect-error: We dont know dynamic names while type checking
            name={props.path.join(".")}
            validate={validate}
          >
            {(field, fieldProps) => (
              <>
                <TextInput
                  inputProps={{
                    ...fieldProps,
                    inputmode: "numeric",
                    pattern: "[0-9.]*",
                    readonly,
                  }}
                  {...commonProps}
                  value={(field.value as unknown as string) || ""}
                  error={field.error}
                  // required
                  // altLabel="Leave empty to accept the default"
                  // helperText="Configure how dude connects"
                  // error="Something is wrong now"
                />
              </>
            )}
          </Field>
        )}
      </Match>
      <Match when={props.schema.enum}>
        {(enumSchemas) => (
          <Field
            // @ts-expect-error: We dont know dynamic names while type checking
            name={props.path.join(".")}
          >
            {(field, fieldProps) => (
              <select
                aria-label={props.schema.title}
                {...fieldProps}
                value={field.value as unknown as string}
              >
                <For each={enumSchemas()}>
                  {(optionSchema) => <OptionSchema itemSpec={optionSchema} />}
                </For>
              </select>
            )}
          </Field>
        )}
      </Match>
      <Match when={props.schema.writeOnly && props.schema}>
        {(s) => (
          <Field
            // @ts-expect-error: We dont know dynamic names while type checking
            name={props.path.join(".")}
            validate={validate}
          >
            {(field, fieldProps) => (
              <TextInput
                inputProps={{ ...fieldProps, readonly }}
                value={field.value as unknown as string}
                type="password"
                error={field.error}
                {...commonProps}
                // required
                // altLabel="Leave empty to accept the default"
                // helperText="Configure how dude connects"
                // error="Something is wrong now"
              />
            )}
          </Field>
        )}
      </Match>
      {/* TODO: when is it a normal string input? */}
      <Match when={props.schema}>
        {(s) => (
          <Field
            // @ts-expect-error: We dont know dynamic names while type checking
            name={props.path.join(".")}
            validate={validate}
          >
            {(field, fieldProps) => (
              <TextInput
                inputProps={{ ...fieldProps, readonly }}
                value={field.value as unknown as string}
                error={field.error}
                {...commonProps}
                // placeholder="foobar"
                // inlineLabel={
                //   <div class="label">
                //     <span class="label-text"></span>
                //   </div>
                // }
                // required
                // altLabel="Leave empty to accept the default"
                // helperText="Configure how dude connects"
                // error="Something is wrong now"
              />
            )}
          </Field>
        )}
      </Match>
    </Switch>
  );
}

interface OptionSchemaProps {
  itemSpec: JSONSchema7Type;
}
export function OptionSchema(props: OptionSchemaProps) {
  return (
    <Switch fallback={<option class="text-error">Item spec unhandled</option>}>
      <Match when={typeof props.itemSpec === "string" && props.itemSpec}>
        {(o) => <option>{o()}</option>}
      </Match>
    </Switch>
  );
}

interface ValueDisplayProps<T extends FieldValues, R extends ResponseData>
  extends SchemaFieldsProps<T, R> {
  children: JSX.Element;
  listFieldName: string;
  idx: number;
  of: number;
}
export function ValueDisplay<T extends FieldValues, R extends ResponseData>(
  props: ValueDisplayProps<T, R>
) {
  const removeItem = (e: Event) => {
    e.preventDefault();
    remove(
      props.formStore,
      // @ts-ignore
      props.listFieldName,
      { at: props.idx }
    );
  };
  const moveItemBy = (dir: number) => (e: Event) => {
    e.preventDefault();
    move(
      props.formStore,
      // @ts-ignore
      props.listFieldName,
      { from: props.idx, to: props.idx + dir }
    );
  };
  const topMost = () => props.idx === props.of - 1;
  const bottomMost = () => props.idx === 0;

  return (
    <div class="flex w-full items-center">
      {props.children}
      <button
        class="btn"
        onClick={moveItemBy(1)}
        disabled={topMost()}
        classList={{}}
      >
        ↓
      </button>
      <button class="btn" onClick={moveItemBy(-1)} disabled={bottomMost()}>
        ↑
      </button>
      <button class="btn btn-error" onClick={removeItem}>
        x
      </button>
    </div>
  );
}

const findDuplicates = (arr: any[]) => {
  const seen = new Set();
  const duplicates: number[] = [];

  arr.forEach((obj, idx) => {
    const serializedObj = JSON.stringify(obj);

    if (seen.has(serializedObj)) {
      duplicates.push(idx);
    } else {
      seen.add(serializedObj);
    }
  });

  return duplicates;
};

export function ArrayFields<T extends FieldValues, R extends ResponseData>(
  props: SchemaFieldsProps<T, R>
) {
  if (props.schema.type !== "array") {
    return (
      <span class="text-error">
        Error cannot render the following as array.
        <Unsupported schema={props.schema} />
      </span>
    );
  }
  const { Field } = props;

  const listFieldName = props.path.join(".");

  return (
    <>
      <Switch fallback={<Unsupported schema={props.schema} />}>
        <Match
          when={
            !Array.isArray(props.schema.items) &&
            typeof props.schema.items === "object" &&
            props.schema.items
          }
        >
          {(itemsSchema) => (
            <>
              <Switch
                fallback={
                  <Unsupported
                    schema={props.schema}
                    error="Array of Array is not supported yet."
                  />
                }
              >
                <Match when={itemsSchema().type !== "array"}>
                  {/* !Important: Register the parent field to gain access to array items*/}
                  <FieldArray
                    // @ts-ignore
                    name={listFieldName}
                    of={props.formStore}
                    validateOn="touched"
                    revalidateOn="touched"
                    validate={() => {
                      let error = "";
                      // @ts-ignore
                      const values: any[] = getValues(
                        props.formStore,
                        // @ts-ignore
                        listFieldName
                      );
                      if (props.schema.uniqueItems) {
                        const duplicates = findDuplicates(values);
                        if (duplicates.length) {
                          error = `Duplicate entries are not allowed. Please make sure each entry is unique.`;
                        }
                      }
                      if (
                        props.schema.maxItems &&
                        values.length > props.schema.maxItems
                      ) {
                        error = `You can only add up to ${props.schema.maxItems} items`;
                      }
                      if (
                        props.schema.minItems &&
                        values.length < props.schema.minItems
                      ) {
                        error = `Please add at least ${props.schema.minItems} items.`;
                      }

                      return error;
                    }}
                  >
                    {(fieldArray) => (
                      <>
                        {/* Render existing items */}
                        <For
                          each={fieldArray.items}
                          fallback={
                            // Empty list
                            <span class="text-neutral-500">No items</span>
                          }
                        >
                          {(item, idx) => (
                            <ValueDisplay
                              {...props}
                              listFieldName={listFieldName}
                              idx={idx()}
                              of={fieldArray.items.length}
                            >
                              <Field
                                // @ts-ignore: field names are not know ahead of time
                                name={`${listFieldName}.${idx()}`}
                              >
                                {(f, fp) => (
                                  <>
                                    <Form
                                      formProps={{
                                        class: cx("w-full"),
                                      }}
                                      schema={itemsSchema()}
                                      initialValues={
                                        itemsSchema().type === "object"
                                          ? f.value
                                          : { "": f.value }
                                      }
                                      readonly={true}
                                    ></Form>
                                  </>
                                )}
                              </Field>
                            </ValueDisplay>
                          )}
                        </For>
                        <span class="label-text-alt font-bold text-error">
                          {fieldArray.error}
                        </span>

                        {/* Add new item */}
                        <Form
                          formProps={{
                            class: cx("px-2 w-full"),
                          }}
                          schema={{ ...itemsSchema(), title: "Add entry" }}
                          initialPath={["root"]}
                          components={{
                            before: <button class="btn">Add ↑</button>,
                          }}
                          // Add the new item to the FieldArray
                          handleSubmit={(values, event) => {
                            // @ts-ignore
                            const prev: any[] = getValues(
                              props.formStore,
                              // @ts-ignore
                              listFieldName
                            );
                            if (itemsSchema().type === "object") {
                              const newIdx = prev.length;
                              setValue(
                                props.formStore,
                                // @ts-ignore
                                `${listFieldName}.${newIdx}`,
                                // @ts-ignore
                                values.root
                              );
                            }
                            // @ts-ignore
                            insert(props.formStore, listFieldName, {
                              // @ts-ignore
                              value: values.root,
                            });
                          }}
                        />
                      </>
                    )}
                  </FieldArray>
                </Match>
              </Switch>
            </>
          )}
        </Match>
      </Switch>
    </>
  );
}

export function ObjectFields<T extends FieldValues, R extends ResponseData>(
  props: SchemaFieldsProps<T, R>
) {
  if (props.schema.type !== "object") {
    return (
      <span class="text-error">
        Error cannot render the following as Object
        <Unsupported schema={props.schema} />
      </span>
    );
  }

  return (
    <Switch fallback={<Unsupported schema={props.schema} />}>
      <Match
        when={!props.schema.additionalProperties && props.schema.properties}
      >
        {(properties) => (
          <For each={Object.entries(properties())}>
            {([propName, propSchema]) => (
              <div
                class={cx(
                  "w-full grid grid-cols-1 gap-4 justify-items-start",
                  `p-${props.path.length * 2}`
                )}
              >
                {/* <span class="text-primary text-sm">Name</span>
                <span class="text-primary text-sm">SubSchema</span> */}

                <span class={"text-primary text-sm"}>{propName}</span>

                {typeof propSchema === "object" && (
                  <SchemaFields
                    {...props}
                    schema={propSchema}
                    path={[...props.path, propName]}
                  />
                )}
                {typeof propSchema === "boolean" && (
                  <span class="text-error">
                    Schema: Object of Boolean not supported
                  </span>
                )}
              </div>
            )}
          </For>
        )}
      </Match>
    </Switch>
  );
}
