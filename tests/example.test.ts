import { describe, it, expect } from 'vitest'
import { setupCounter } from '../src/counter.ts'

describe('setupCounter', () => {
  it('renders initial count and increments on click', () => {
    const button = document.createElement('button')
    setupCounter(button)
    expect(button.textContent).toBe('count is 0')

    button.click()
    expect(button.textContent).toBe('count is 1')

    button.click()
    expect(button.textContent).toBe('count is 2')
  })
})

