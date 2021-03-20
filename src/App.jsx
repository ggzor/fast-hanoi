import React, { useEffect, useReducer, useState } from 'react'
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
  FaPause,
  FaPlay,
  FaRedo,
  FaStepBackward,
  FaStepForward,
} from 'react-icons/fa'
import { ColorModeSwitcher } from './ColorModeSwitcher'
import { motion, AnimateSharedLayout } from 'framer-motion'
import { useHanoi } from './hanoi'

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

const AnimatedFlex = motion(Flex)
const AnimatedBox = motion(Box)

const useTimer = (step, action, stopWhen) => {
  const [playing, setPlaying] = useState(false)

  if (playing && stopWhen) setPlaying(false)

  useEffect(() => {
    if (playing) {
      const id = setInterval(() => action(), step)
      return () => clearInterval(id)
    }
  }, [action, step, playing])

  const playPause = () => setPlaying((n) => !n)

  return [playing, playPause]
}

const Runner = ({ goBack, n }) => {
  const boxColor = useColorModeValue('gray.500', 'gray.200')
  const pileColor = useColorModeValue('gray.400', 'gray.500')

  const {
    state: { i, piles, total },
    actions: { step, stepBack, reset },
    selectors: { canStep, canStepBack },
  } = useHanoi(n)

  const [playing, playPause] = useTimer(400, step, !canStep)

  const resetHanoi = () => {
    if (playing) {
      playPause()
    }

    reset()
  }

  const playPauseHanoi = () => {
    if (!playing && canStep) step()

    playPause()
  }

  return (
    <VStack spacing={8} alignSelf="center">
      <VStack spacing={0}>
        <Text fontSize="6xl" color={boxColor}>
          {i}
        </Text>
        <Text color={boxColor}>{total - i}</Text>
      </VStack>
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
        <IconButton
          icon={playing ? <FaPause /> : <FaPlay />}
          disabled={!canStep}
          onClick={playPauseHanoi}
        ></IconButton>
        <IconButton icon={<FaRedo />} onClick={resetHanoi}></IconButton>
        <IconButton
          icon={<FaStepBackward />}
          onClick={stepBack}
          disabled={playing || !canStepBack}
        ></IconButton>
        <IconButton
          icon={<FaStepForward />}
          onClick={step}
          disabled={playing || !canStep}
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
