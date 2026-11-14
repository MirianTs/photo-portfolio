import { test } from 'node:test'
import assert from 'node:assert/strict'
import { safePathPart } from '../src/lib/storagePath.js'

test('keeps safe file names unchanged', () => {
  assert.equal(safePathPart('IMG_0042.jpeg'), 'IMG_0042.jpeg')
})

test('replaces spaces and runs of unsafe characters with one dash', () => {
  assert.equal(safePathPart('WhatsApp Image (1).jpeg'), 'WhatsApp-Image-1-.jpeg')
})

test('replaces non-Latin letters', () => {
  assert.equal(safePathPart('ბუნება'), 'file')
  assert.equal(safePathPart('ქუჩა street'), 'street')
})

test('trims leading and trailing dashes', () => {
  assert.equal(safePathPart('  nature  '), 'nature')
})

test('falls back to "file" when nothing safe is left', () => {
  assert.equal(safePathPart(''), 'file')
  assert.equal(safePathPart('***'), 'file')
})
