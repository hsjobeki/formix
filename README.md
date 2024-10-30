# Formix

**Formix** is an opinionated, modular, and highly customizable library for rendering JSON schema into beautifully styled and functional form elements.

Designed specifically for **Solid.js** with suppport for [**NixOS**](https://nixos.wiki/wiki/NixOS_modules) and [**Clan modules**](https://docs.clan.lol/reference/clanModules/). Formix makes it easy to build complex forms from JSON schema with effortless configuration and customization.

## Features

- **Modular and Configurable**: Easily configure form elements to suit a variety of use cases.
- **Solid.js Integration**: Built with Solid.js at its core for reactive, high-performance forms.
- **NixOS Friendly**: Meant to be a UI building block for NixOS System configurations.
- **Highly User friendly**: Tackles common UX challenges by offering a high level of customizability ranging from NixOS Module meta configuration to custom UI Components.

## Installation

Install **Formix** through npm:

```bash
npm install formix
```

## Quick Start

Here's a quick example to get you up and running with **Formix**.

```jsx
import { Formix } from "formix";
import { jsonSchema } from "./your-schema";

function App() {
  return (
    <div>
      <h1>Example Form</h1>
      <Formix schema={jsonSchema} />
    </div>
  );
}

export default App;
```

### JSON Schema Example

```json
{
  "title": "User Registration",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "title": "Name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email"
    },
    "password": {
      "type": "string",
      "format": "password",
      "title": "Password"
    }
  },
  "required": ["name", "email", "password"]
}
```

## Configuration and Customization

Formix offers several ways to configure and customize forms:

- **Schema Modularity**: Build and combine schema parts for complex forms.
- **Custom Components**: Replace default form elements with custom components.
- **Styling**: Compatible with various CSS frameworks or your own custom styling.

```jsx
<Formix
  schema={jsonSchema}
  config={{
    theme: "your-theme-class",
    customComponents: {
      input: CustomInput,
      select: CustomSelect,
    },
  }}
/>
```

## Documentation

Explore the full documentation [here](https://your-documentation-link.com) for detailed information on advanced usage, configuration, and NixOS module integration.

## Contributing

Contributions are welcome! Please read the [contributing guide](CONTRIBUTING.md) to get started.

## License

MIT License. See [LICENSE](LICENSE) for more information.

---
