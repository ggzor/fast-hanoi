import React, { useEffect, useReducer, useState } from 'react'
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SlideFade,
  extendTheme,
  IconButton,
  Text,
  HStack,
  Flex,
  useColorModeValue,
  Link,
} from '@chakra-ui/react'
import {
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
  FaGithub,
  FaPause,
  FaPlay,
  FaRedo,
  FaStepBackward,
  FaStepForward,
} from 'react-icons/fa'
import { ColorModeSwitcher } from './ColorModeSwitcher'
import { motion, AnimateSharedLayout } from 'framer-motion'
import { useHanoi } from './hanoi'
import { useCounter } from './hooks'

const theme = extendTheme({
  config: { initialColorMode: 'dark', useSystemColorMode: false },
})

const Menu = ({ n, proceed }) => {
  const minHanoi = 1
  const maxHanoi = 10

  const [count, inc, dec, { check }] = useCounter(minHanoi, maxHanoi, n)

  return (
    <VStack spacing={16}>
      <VStack spacing={8}>
        <VStack spacing={4}>
          <IconButton
            icon={<FaChevronUp />}
            disabled={!check.canIncrement}
            onClick={inc}
          ></IconButton>
          <Text fontSize="6xl">{count}</Text>
          <IconButton
            icon={<FaChevronDown />}
            onClick={dec}
            disabled={!check.canDecrement}
          ></IconButton>
        </VStack>
        <IconButton
          icon={<FaPlay />}
          onClick={() => proceed(count)}
        ></IconButton>
      </VStack>
      <HStack>
        <FaGithub fontSize="0.7em" />
        <Link
          fontSize="0.7em"
          href="https://github.com/ggzor/fast-hanoi"
          isExternal
        >
          ggzor
        </Link>
      </HStack>
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
    actions: { step, stepBack, reset, setTo },
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
    <VStack padding={4} spacing={8} alignSelf="center">
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
          onClick={() => setTo(i + 1)}
          disabled={playing || !canStep}
        ></IconButton>
      </HStack>
      <SlideFade in={!playing}>
        <Slider
          width="90vw"
          min={0}
          max={total - 1}
          onChange={setTo}
          value={i}
          isReadOnly={playing}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </SlideFade>
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
