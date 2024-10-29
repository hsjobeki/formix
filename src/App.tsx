import { createQuery } from "@tanstack/solid-query";
import { createSignal, For, Match, Switch, type Component } from "solid-js";
import { JSONSchema7 } from "json-schema";
import { TextInput } from "./components/fields/TextInput";
import { FormSection } from "./components/fields/FormSection";
import { Form } from "./components/form";

const schemas = ["strings", "numbers", "list", "borgbackup-client"];

const App: Component = () => {
  const [schemaName, setSchemaName] = createSignal<string>(schemas[0]);

  const query = createQuery(() => ({
    queryKey: [schemaName()],
    queryFn: async () => {
      console.log("importing", schemaName());
      const schema = (await import(`./schemas/${schemaName()}.json`)).default;
      // const schema = {};
      console.log("loaded", { schema });
      return JSON.stringify(schema, null, 2);
    },
  }));
  return (
    <div>
      <h1 class="w-full text-center">Schema Playground</h1>
      <div
        class="grid gap-2 m-2 p-2 grid-cols-4 max-w-lg"
        onChange={(e) => {
          // @ts-expect-error: We dont know
          setSchemaName(e.target.ariaLabel);
        }}
      >
        <For each={schemas}>
          {(s) => (
            <input type="radio" name="radio-10" class="btn" aria-label={s} />
          )}
        </For>
      </div>
      <Switch>
        <Match when={query.isLoading}>Loading...</Match>
        <Match when={query.data}>
          {(d) => (
            <div class="grid grid-cols-3 gap-2">
              <div class="w-full border border-gray-600 p-2 overflow-scroll">
                <h3>Schema</h3>
                <pre class="text-sm">
                  <code>{d() + "\n"}</code>
                </pre>
              </div>
              <div class="preview w-full h-full p-2 col-span-2">
                <h3>Preview</h3>
                <Form
                  schema={JSON.parse(d()) as JSONSchema7}
                  initialValues={{}}
                  components={{
                    after: <button class="btn">Submit</button>,
                  }}
                  handleSubmit={(values, event) => {
                    console.log(values["complex-items"]);
                  }}
                ></Form>
                {/* <FormSection>
                  <TextInput
                    label="Simple String"
                    value=""
                    placeholder="foobar"
                    inlineLabel={
                      <div class="label">
                        <span class="label-text">root@</span>
                      </div>
                    }
                    required
                    altLabel="Leave empty to accept the default"
                    helperText="Configure how dude connects"
                    error="Something is wrong now"
                  />
                </FormSection> */}
              </div>
            </div>
          )}
        </Match>
      </Switch>
    </div>
  );
};

export default App;
