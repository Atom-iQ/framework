Atom-iQ Development Processes
=============================
###### Currently, working on: `v0.1.0` - *"initial NPM release"*

#### Menu
- [Versioning & Development Roadmap](#versioning--development-roadmap)
- [Repository Structure](#repository-structure)
- [Development Tools](#development-tools)

### Versioning & Development Roadmap
> **Atom-iQ** is using _**Semantic Versioning 2.0.0**_

#### Standardized version numbers for all **Atom-iQ** packages
> The **Atom-iQ** framework is made of the **Core** `@atom-iq/core` library and official packages - **Middlewares**,
> **Tools**, **Components**, along with the main development tool **iQ CLI** `@atom-iq/cli` (with **CLI Extensions**)
> and other development tools. All official packages are under `@atom-iq` npm scope.

The **major version number** is shared between packages, and for cross-package compatibility, it should be the same
for all `@atom-iq` packages. Release of the **major version**, should include all packages, even if not all package updates
includes breaking changes - because, the **major version** is changing in context of the framework, not concrete package.

The **minor** and **patch** version numbers, depend on the concrete package.
> Exception: **Before `v1.0.0`, all the compatible packages will have the same *minor* version number**

#### The development of the framework will be divided into 2 main stages
- _**Early development stage**_ - before first stable release (`v1.0.0`). It has also 2 more specific stages:
  - **Initial development (Core/CLI)** - creating `@atom-iq/core` & `@atom-iq/cli` libraries from scratch,
    until release of first **NPM** _(unstable)_ version (`v0.1.0`) - means that:
    - `@atom-iq/core` RvDOM Renderer is rendering properly **Components**, state changes, etc., along with fixed array rendering.
    - `@atom-iq/cli` is able to start (`iq start`) dev server and watch file's changes. The `iq build` command for
      build production release, should also be implemented.
    - refactored `@atom-iq/babel-plugin-iq-jsx`
    - sets of unit tests for packages
  - **Framework ecosystem development/optimization** - stage between `v0.1.0` and `v1.0.0`
    - `@atom-iq/core` will have middlewares handling implemented (starting from `v0.2.0`)
    - `@atom-iq/cli` will have implemented `iq project <projectName> [--options]` command - for generating
      new projects
    - new, official **Middlewares** and **Tools** packages - `v1.0.0` should contain a rich set of official
      extensions libraries - currently planned packages (some of them are musts for `v1.0.0`, other are
      optional and may be released later):
      - `@atom-iq/rx` - iQRx Tools - intelligent abstraction over **RxJS**, for better development
        experience with **Atom-iQ** - including special, "lazy" evaluated **iQRx Tagged Template Expressions**,
        along with normal functions and operators
      - `@atom-iq/ref` - `Ref` is a core feature in **React** and similar **vDOM** libraries, in **Atom-iQ**
        it's moved to **Middlewares** and is _optional_. Anyway, its role is the same as in **vDOM**,
        but because of architectural differences, its interface and usage is different - but looks and feels
        similar - like most of the same-purpose features in **Atom-iQ Reactive Virtual DOM** and **React** (or
        similar lib) **Virtual DOM**. However,  **Atom-iQ** implementations, are _**always more reactive**_,
        and _probably **always more functional and declarative**_.
      - `@atom-iq/context` - The same as above.
      - `@atom-iq/lifecycle` - And the same here too. However, **Components lifecycle** in `rvDOM` is a lot
        simpler than in `vDOM` - check [Component docs Lifecycle section](docs/framework/COMPONENT.md#lifecycle)
      - `@atom-iq/router` - Official router library - should be based on `react-router-dom`, but re-implemented
        for **Reactive** architecture.
      - `@atom-iq/store` - custom, **RxJS** powered state management **Middleware**, basing on **Flux**,
        with elements from different implementations, like most popular **Redux**, but scalable - allowing different
        methods of computing state
      - `@atom-iq/ssr` - server side rendering for **Atom-iQ**
      - `@atom-iq/rx-ml` - Micro templating language, working as `iQRxML` tagged template - all data binding are
        made with tagged template interpolations, but it's extending standard **HTML** markup with a special **Pipeline
        Pseudo Nodes** - dedicated for easy handling operations on **RxJS Observable** streams, that are mapped to
        **RvdNodes**. It's also allowing **Components**, the same way as in **JSX**:
        ```jsx
        const rvDOM = iQRxML`<SomeComponent textProp="test" prop=${prop} ...${rest} />`
        ```
        As a **JSX** in **Atom-iQ** is enabling standard **HTML** prop names, like `class`, `for`, etc. (JS
        equivalents works too), **iQRxML** with **Components** are closer to **JSX**, than to **HTML**. They both
        evaluate to `rvDOM` nodes "create" functions and could be assigned to variables / constants, and could be
        even both mixed.
      - `@atom-iq/rx-ml-aot` - **AOT Pre-compiler** for **iQRxML** - _dev_ package, the extension for **iQ CLI**. By
        default, `iQRxML` tagged templates are evaluated on runtime, when executed as in example return values
        of **Components**. In the opposition to **JSX**, that's transpiled on build time. It's then making `iQRxML`
        useless for production cases. This **Pre-compiler** should evaluate templates on build time, so after that step,
        they should have the same output, as transpiled **JSX**.
    - development of performance tests and implementing benchmarks, to check RAW performance of **Atom-iQ**
    - basing on performance results, constant improvement and optimization of:
      - `@atom-iq/core` library, especially the Renderer
      - `@atom-iq/cli` and build process - concept/tool for pre-evaluation of `JS` & `rvDOM` - move as many runtime
         operations as possible to compile time.
      - `@atom-iq/babel-plugin-iq-jsx` - plugin optimization - it started as a fork of a [simple, framework-agnostic
        plugin](https://github.com/calebmer/node_modules/tree/master/babel-plugin-transform-jsx), but although `rvDOM`
        doesn't need as big optimizations, as example `vDOM` in **Inferno**, it could be only faster and better,
        if we use such optimizations. This led to the decision to rewrite the **Atom-iQ** plugin based on
        the **Inferno** plugin.
      - optimizations, should be concentrated on build time pre-evaluation of the `rvDOM` Components - consider a fork
        of **Facebook's** `prepack` - **Atom-iQ** and **Reactive Virtual DOM** have great potential for this kind
        of optimization because _props, state, and elements are immutable, and their references **never change at runtime**_.
    - official **Atom-iQ** web page - written of course with **Atom-iQ**
- _**Regular development stage**_ (`v1.x.x`+)
  - Scheduled **major** versions releases
  - Constant improvement of existing packages
  - Development of new framework packages

### Repository Structure
This repository is a `monorepo` for all official **Atom-iQ** framework packages, with the structure:
- `packages` - contains `@atom-iq/core` and **Middleware** and **Tools** packages
- `dev-packages` - contains `@atom-iq/cli` and other development packages, like plugins, etc.
- `docs` - contains *Markdown* documentation files
- during development, the official webpage will be also created (in **Atom-iQ**, off course) and stored in `web` directory
  in repository
> Personally, I'm not a fan of `monorepo`, for projects in different programming languages, but for only
> JavaScript/TypeScript project it works fine, allowing sharing a lot of build/development tools config.
### Development Tools
