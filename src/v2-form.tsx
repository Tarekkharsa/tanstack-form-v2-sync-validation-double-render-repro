import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { countRender, LABELS } from './renders'

const minTwo = z.string().min(2, 'At least 2 characters')

export function V2Form() {
  const form = useForm({ defaultValues: { plain: '', fn: '', schema: '' } })

  return (
    <fieldset>
      <legend>@tanstack/react-form 2.0.0-alpha.3</legend>
      <form.Field name="plain">
        {(field) => {
          countRender('v2', 'plain')
          return (
            <label>
              {LABELS.plain}
              <input
                data-testid="v2-plain"
                value={field.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )
        }}
      </form.Field>
      <form.Field
        name="fn"
        validators={[
          {
            triggers: ['change'],
            run: ({ value }) => (value.length >= 2 ? undefined : 'At least 2 characters'),
          },
        ]}
      >
        {(field) => {
          countRender('v2', 'fn')
          return (
            <label>
              {LABELS.fn}
              <input
                data-testid="v2-fn"
                value={field.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <small>{field.meta.errors.map((error) => error.message).join(', ')}</small>
            </label>
          )
        }}
      </form.Field>
      <form.Field name="schema" validators={[{ triggers: ['change'], run: minTwo }]}>
        {(field) => {
          countRender('v2', 'schema')
          return (
            <label>
              {LABELS.schema}
              <input
                data-testid="v2-schema"
                value={field.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <small>{field.meta.errors.map((error) => error.message).join(', ')}</small>
            </label>
          )
        }}
      </form.Field>
    </fieldset>
  )
}
