import { range, scan } from 'ramda'
import { useMemo } from 'react'

import { produce } from 'immer'
import { useCounter } from './hooks'

const move = (from, to) => ({ from, to })
function* hanoi(n, src, dest, temp) {
  if (n === 1) {
    yield move(src, dest)
  } else {
    yield* hanoi(n - 1, src, temp, dest)
    yield move(src, dest)
    yield* hanoi(n - 1, temp, dest, src)
  }
}

const applyMove = (piles, { from, to }) =>
  produce(piles, (newPiles) => {
    const disk = newPiles[from].pop()
    newPiles[to].push(disk)
  })

const initialPilesOf = (n) => [range(1, n + 1).reverse(), [], []]

const hanoiStates = (n) =>
  scan(applyMove, initialPilesOf(n), [...hanoi(n, 0, 2, 1)])

export const useHanoi = (n) => {
  const states = useMemo(() => hanoiStates(n), [n])

  const [
    i,
    step,
    stepBack,
    {
      check,
      do: { setTo },
    },
  ] = useCounter(0, states.length - 1, 0)

  return {
    state: { i, piles: states[i], total: states.length },
    actions: { step, stepBack, reset: () => setTo(0), setTo },
    selectors: { canStep: check.canIncrement, canStepBack: check.canDecrement },
  }
}
