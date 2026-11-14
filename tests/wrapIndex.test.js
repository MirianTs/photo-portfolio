import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wrapIndex } from '../src/lib/wrapIndex.js'

test('moves within the list', () => {
  assert.equal(wrapIndex(2, 5), 2)
})

test('wraps past the last item to the first', () => {
  assert.equal(wrapIndex(5, 5), 0)
})

test('wraps before the first item to the last', () => {
  assert.equal(wrapIndex(-1, 5), 4)
})

test('handles offsets larger than the list', () => {
  assert.equal(wrapIndex(-7, 5), 3)
  assert.equal(wrapIndex(12, 5), 2)
})

test('returns 0 for an empty list', () => {
  assert.equal(wrapIndex(1, 0), 0)
})
