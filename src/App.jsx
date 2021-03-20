import React, { useMemo, useReducer } from 'react'
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  extendTheme,
  IconButton,
  Text,
  HStack,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaRedo,
  FaStepBackward,
  FaStepForward,
} from 'react-icons/fa'
import { ColorModeSwitcher } from './ColorModeSwitcher'
import { range } from 'ramda'
import { motion, AnimateSharedLayout } from 'framer-motion'

const theme = extendTheme({
  config: { initialColorMode: 'dark', useSystemColorMode: false },
})

const useCounter = (min, max, value) => {
  const [count, setCount] = useState(value)

  const inc = () => setCount((c) => (c < max ? c + 1 : c))
  const dec = () => setCount((c) => (min < c ? c - 1 : c))

  return [count, inc, dec]
}

const Menu = ({ n, proceed }) => {
  const minHanoi = 1
  const maxHanoi = 10

  const [count, inc, dec] = useCounter(minHanoi, maxHanoi, n)

  return (
    <VStack spacing={8}>
      <VStack spacing={4}>
        <IconButton
          icon={<FaChevronUp />}
          disabled={!(count < maxHanoi)}
          onClick={inc}
        ></IconButton>
        <Text fontSize="6xl">{count}</Text>
        <IconButton
          icon={<FaChevronDown />}
          onClick={dec}
          disabled={!(minHanoi < count)}
        ></IconButton>
      </VStack>
      <IconButton icon={<FaPlay />} onClick={() => proceed(count)}></IconButton>
    </VStack>
  )
}

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

const AnimatedFlex = motion(Flex)
const AnimatedBox = motion(Box)

const Runner = ({ goBack, n }) => {
  const boxColor = useColorModeValue('gray.500', 'gray.200')
  const pileColor = useColorModeValue('gray.400', 'gray.500')

  const movements = useMemo(() => [...hanoi(n, 0, 2, 1)], [n])

  const initialPiles = () => [range(1, n + 1).reverse(), [], []]

  const canStep = ({ i }) => i < movements.length
  const canStepBack = ({ i }) => 0 < i

  const [state, apply] = useReducer(
    (old, act) => {
      switch (act.type) {
        case 'step': {
          if (canStep(old)) {
            return {
              piles: applyMove(old.piles, movements[old.i]),
              i: old.i + 1,
            }
          }

          break
        }
        case 'backStep': {
          if (canStepBack(old)) {
            return {
              piles: applyMove(old.piles, reverseMove(movements[old.i - 1])),
              i: old.i - 1,
            }
          }

          break
        }
        case 'reset': {
          return {
            piles: initialPiles(),
            i: 0,
          }
        }
        default:
          return old
      }

      return old
    },
    { piles: initialPiles(), i: 0 }
  )

  const { piles, i } = state

  const applyBuild = (type) => () => apply({ type })
  const step = applyBuild('step')
  const backStep = applyBuild('backStep')
  const reset = applyBuild('reset')

  return (
    <VStack spacing={8} alignSelf="center">
      <Text fontSize="6xl" color={boxColor}>
        {i}
      </Text>
      <Grid
        templateColumns="repeat(3, 20vw)"
        gridColumnGap="10vw"
        height="40vh"
      >
        <AnimateSharedLayout>
          {piles.map((disks, i) => (
            <AnimatedFlex
              layout
              key={i}
              direction="column-reverse"
              alignItems="center"
            >
              <Box bg={pileColor} width="100%" height="0.3vh" marginTop="2px" />
              {disks.map((d) => (
                <AnimatedBox
                  layoutId={d}
                  key={d}
                  bg={boxColor}
                  width={`${20 + d * (80 / n)}%`}
                  height="2vh"
                  borderRadius="25%"
                  marginTop="5px"
                />
              ))}
            </AnimatedFlex>
          ))}
        </AnimateSharedLayout>
      </Grid>
      <HStack>
        <IconButton
          icon={<FaArrowLeft />}
          onClick={() => goBack(n)}
        ></IconButton>
        <IconButton icon={<FaPlay />}></IconButton>
        <IconButton icon={<FaRedo />} onClick={reset}></IconButton>
        <IconButton
          icon={<FaStepBackward />}
          onClick={backStep}
          disabled={!canStepBack(state)}
        ></IconButton>
        <IconButton
          icon={<FaStepForward />}
          onClick={step}
          disabled={!canStep(state)}
        ></IconButton>
      </HStack>
    </VStack>
  )
}

function App() {
  const [{ phase, n }, apply] = useReducer(
    (old, act) => {
      switch (act.type) {
        case 'proceed':
          return {
            phase: 'main',
            n: act.with,
          }
        case 'goBack':
          return {
            phase: 'initial',
            n: act.with,
          }

        default:
          return old
      }
    },
    { phase: 'initial', n: 4 }
  )

  const proceed = (n) => apply({ type: 'proceed', with: n })
  const goBack = (n) => apply({ type: 'goBack', with: n })

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={1}>
          {phase === 'initial' ? (
            <>
              <ColorModeSwitcher justifySelf="flex-end" />
              <Menu proceed={proceed} n={n} />
            </>
          ) : (
            <Runner goBack={goBack} n={n}></Runner>
          )}
        </Grid>
      </Box>
    </ChakraProvider>
  )
}

export default App
