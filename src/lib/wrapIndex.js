// Step through a list in a loop: past the last item comes the first again,
// and before the first comes the last. Works for any offset, not just ±1,
// and returns 0 for an empty list instead of NaN.
export const wrapIndex = (index, length) =>
  length > 0 ? ((index % length) + length) % length : 0
