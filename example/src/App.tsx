import type { Component } from "solid-js";

import { Form } from "formix";
const schema = {};

import { type JSONSchema7 } from "json-schema";

const App: Component = () => {
  return (
    <div>
      Test
      <Form schema={schema as JSONSchema7} />
    </div>
  );
};

export default App;
