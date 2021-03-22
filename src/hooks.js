import { useCallback, useState } from 'react'

export const useCounter = (min, max, value) => {
  const [count, setCount] = useState(value)

  const canIncrement = count < max
  const canDecrement = min < count

  const increment = useCallback(() => {
    if (canIncrement) setCount((i) => i + 1)
  }, [canIncrement, setCount])

  const decrement = useCallback(() => {
    if (canDecrement) setCount((i) => i - 1)
  }, [canDecrement, setCount])

  return [
    count,
    increment,
    decrement,
    { do: { setTo: setCount }, check: { canIncrement, canDecrement } },
  ]
}
