# TanStack Form v2: a synchronous change validator renders its field twice per keystroke

A minimal Vite + React app. On `@tanstack/react-form` 2.0.0-alpha.3, a field with a synchronous change validator renders about twice per keystroke: once for the new value, then again a microtask later for the validation result. That holds for a plain function validator and for a Standard Schema that validates synchronously. On 1.33.5, the same field renders once per keystroke.

- Issue: https://github.com/TanStack/form/issues/2446
- Fix: https://github.com/TanStack/form/pull/2447

## Versions

| Package | Version |
| --- | --- |
| `@tanstack/react-form` | 2.0.0-alpha.3, and 1.33.5 through the `@tanstack/react-form-v1` alias |
| `@tanstack/form-core` | 2.0.0-alpha.3 and 1.33.5 |
| `react`, `react-dom` | 19.2.8 |
| `zod` | 4.4.3 |
| `vite` | 8.3.1 |

## The app

- `src/v1-form.tsx` and `src/v2-form.tsx` render the same three fields, one form per version:
  - `plain`: no validator, the control;
  - `fn`: a synchronous change validator, `value.length >= 2 ? undefined : 'At least 2 characters'`;
  - `schema`: a synchronous Standard Schema change validator, `z.string().min(2)`.
- Every field's render prop increments `window.__renders[version][field]`.
- `StrictMode` is off, so render functions run once per render.

## Run it

```sh
pnpm i
pnpm test
```

`pnpm test` builds, serves the build with `vite preview`, and types `abc` into each field in Chromium, one key at a time. It prints how many times each field rendered for the three keystrokes, and exits 1 when a validated field renders more often than the `plain` field of the same version.

## Expected

A field with a synchronous change validator renders as often as the same field without one: once per keystroke, with the validation result in the same render as the value.

## Actual

```
@tanstack/react-form 1.33.5
  ok   no validator                     3 renders for 3 keystrokes
  ok   sync function validator          3 renders for 3 keystrokes
  ok   sync Standard Schema validator   3 renders for 3 keystrokes
@tanstack/react-form 2.0.0-alpha.3
  ok   no validator                     3 renders for 3 keystrokes
  FAIL sync function validator          8 renders for 3 keystrokes
  FAIL sync Standard Schema validator   8 renders for 3 keystrokes
```

## Why

On the v2 alpha, every step of change validation is asynchronous, even when the validator is not:

- `executeValidator` in `form-core/src/validation/execution.lib.ts` is `async`, and `parseStandardSchema` wraps the schema result in `Promise.resolve(...)`.
- `runMaybeDebouncedValidator` always runs the validator through `Promise.race` in `executeWithAbort`.
- `runValidatorPipeline` in `pipeline.lib.ts` awaits every result before calling `onResult`.
- `FieldApi._runFieldValidation` raises the field's validation count, `await`s the pipeline, and lowers the count in `finally`.

So the value change renders with `isValidating: true`, and the result plus `isValidating: false` render again a tick later. Mount validation already avoids this: `_runMountValidation` and `runFieldMountValidatorPipeline` apply synchronous results synchronously through `isPromiseLike`.

## With a fix

The same pattern applied to change and blur validation (apply a synchronous result immediately, go asynchronous only when a validator returns a promise or is debounced) brings v2 back to one render per keystroke. [TanStack/form#2447](https://github.com/TanStack/form/pull/2447) makes that change. Overriding only `@tanstack/form-core` with a build of it gives:

```
@tanstack/react-form 2.0.0-alpha.3
  ok   no validator                     3 renders for 3 keystrokes
  ok   sync function validator          3 renders for 3 keystrokes
  ok   sync Standard Schema validator   3 renders for 3 keystrokes
```

To try a local build, pack form-core with `pnpm pack` and add an override to `pnpm-workspace.yaml`:

```yaml
overrides:
  "@tanstack/form-core@2.0.0-alpha.3": "file:/path/to/tanstack-form-core-2.0.0-alpha.3.tgz"
```
