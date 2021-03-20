import { range } from 'ramda'
import { useMemo, useState } from 'react'

const reverseMove = ({ from, to }) => ({ from: to, to: from })

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

const applyMove = (piles, { from, to }) => {
  const newPiles = [...piles]

  newPiles[from] = piles[from].slice(0, piles[from].length - 1)
  newPiles[to] = [...piles[to], piles[from][piles[from].length - 1]]

  return newPiles
}

const initialPilesOf = (n) => [range(1, n + 1).reverse(), [], []]

export const useHanoi = (n) => {
  const movements = useMemo(() => [...hanoi(n, 0, 2, 1)], [n])

  const initialState = () => [0, initialPilesOf(n)]
  const [[i, piles], setState] = useState(initialState)

  const canStep = i < movements.length
  const canStepBack = 0 < i

  const step = () => {
    if (canStep)
      setState(([i, piles]) => [i + 1, applyMove(piles, movements[i])])
  }

  const stepBack = () => {
    if (canStepBack) {
      setState(([i, piles]) => [
        i - 1,
        applyMove(piles, reverseMove(movements[i - 1])),
      ])
    }
  }

  const reset = () => setState(initialState)

  return {
    state: { i, piles, total: movements.length },
    actions: { step, stepBack, reset },
    selectors: { canStep, canStepBack },
  }
}
