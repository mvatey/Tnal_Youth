# Component structure

Components are grouped by ownership. Keep feature-specific components with their
feature and place only reusable building blocks in the shared folders.

```text
components/
|-- account/          Account profile and account navigation
|-- activity/         Activity-specific views and dialogs
|-- auth/             Authentication forms
|-- branch/           Branch-specific views and dialogs
|-- dashboard/        Dashboard charts, cards, and summaries
|-- document/         Document forms, tables, and previews
|-- donations/        Donation features
|   |-- eventdonation/
|   |-- monthlydonation/
|   `-- sponsor/
|-- errors/           Error-state screens
|-- forms/            Reusable input controls and fields
|-- loading/          Public loading/landing experience
|-- member/           Member-specific components
|   `-- cards/        Member document and identity cards
|-- modals/           Shared modal shells and dialogs
|-- navigation/       Application navigation
|-- notifications/    Notification feature components
|-- providers/        React context providers
|-- tables/           Reusable table controls and table primitives
`-- ui/               Small, generic UI primitives
    |-- actions/      Reusable command buttons
    `-- feedback/     Reusable alerts and status feedback
```

## Conventions

- Use `PascalCase.js` for component files and match the filename to the exported
  component.
- Import across folders through the `@/components/...` alias.
- Keep data, hooks, and business rules outside `components/` unless they exist
  only to support one component feature.
- Add a component to `ui/`, `forms/`, `tables/`, or `modals/` only when it is
  reused by more than one feature.
- Put feature-only subcomponents in a subfolder owned by that feature.
- Keep command buttons in `ui/actions`, alerts in `ui/feedback`, and overlays
  in `modals`; `forms` is reserved for fields and input controls.
