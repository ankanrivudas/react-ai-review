import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../src/App'

test('renders heading', () => {
  render(<App />)
  expect(screen.getByText(/React AI Review Sample/i)).toBeInTheDocument()
})
