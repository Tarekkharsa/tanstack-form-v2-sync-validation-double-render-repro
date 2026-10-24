import { createRoot } from 'react-dom/client'
import './renders'
import { V1Form } from './v1-form'
import { V2Form } from './v2-form'

function App() {
  return (
    <main style={{ display: 'grid', gap: 16, fontFamily: 'system-ui', maxWidth: 520 }}>
      <h1>Renders per keystroke</h1>
      <p>
        Type into each field and compare <code>window.__renders</code>. A field
        with a synchronous change validator should render as often as the field
        without one.
      </p>
      <V1Form />
      <V2Form />
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
