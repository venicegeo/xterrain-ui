# xterrain-ui

## Running Locally for Development

```bash
./scripts/develop.sh
```


## Deployment

```
# Compile static assets and create zip file suitable for deployment
./scripts/package.sh

# Compile static assets only
./scripts/compile.sh
```


## Extending

### Adding a new Operation (as of `2017-07-06`)

Relative modularity was the original design strategy of the UI components, so operations
can be added/removed with as few code changes possible.

#### 1. Create subfolder of components

Probably makes the most sense to just copy an existing operation's subfolder and modify
things as necessary.

For an imaginary operation `Fooshed`, that would look something like:

```
fooshed/
├── Fooshed.vue
├── SomeWidget.vue
├── SomeOtherWidget.vue
└── map-delegate.js
```

#### 2. Add a reference to `src/Operation.js`

```js
// (other imports)

import Fooshed from './fooshed/Fooshed.vue'

const COMPONENTS = {
    // (other components...)
    'fooshed': Fooshed,
}
```

#### 3. Isolate operation-specific concerns

Keeping any operation-specific state contained in the `Fooshed` component's instance state
and using the `map-delegate.js` to install and purge operation-specific functionality,
interactions and controls into the map instance ensures that operations with very different
inputs and workflows (e.g., GeoRing vs Viewshed) can be enabled and disabled without
breaking things or leaking memory/resources.
