import { useForm } from '@tanstack/react-form-v1'
import { z } from 'zod'
import { countRender, LABELS } from './renders'

const minTwo = z.string().min(2, 'At least 2 characters')

export function V1Form() {
  const form = useForm({ defaultValues: { plain: '', fn: '', schema: '' } })

  return (
    <fieldset>
      <legend>@tanstack/react-form 1.33.5</legend>
      <form.Field name="plain">
        {(field) => {
          countRender('v1', 'plain')
          return (
            <label>
              {LABELS.plain}
              <input
                data-testid="v1-plain"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )
        }}
      </form.Field>
      <form.Field
        name="fn"
        validators={{
          onChange: ({ value }) => (value.length >= 2 ? undefined : 'At least 2 characters'),
        }}
      >
        {(field) => {
          countRender('v1', 'fn')
          return (
            <label>
              {LABELS.fn}
              <input
                data-testid="v1-fn"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <small>{field.state.meta.errors.join(', ')}</small>
            </label>
          )
        }}
      </form.Field>
      <form.Field name="schema" validators={{ onChange: minTwo }}>
        {(field) => {
          countRender('v1', 'schema')
          return (
            <label>
              {LABELS.schema}
              <input
                data-testid="v1-schema"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <small>
                {field.state.meta.errors.map((error) => error?.message).join(', ')}
              </small>
            </label>
          )
        }}
      </form.Field>
    </fieldset>
  )
}
