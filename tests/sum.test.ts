import { describe, it, expect } from 'vitest'
import { sum } from '../src/sum.ts'

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3)
    expect(sum(-1, 1)).toBe(0)
  })
})
