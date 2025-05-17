import React from 'react'
import {Html, Body, Container, Text, Link, Preview, Head, Tailwind} from '@react-email/components'

const WelcomeTemplate = ({name}:{name: String}) => {
  return (
    <Html>
      <Preview>Welcome</Preview>
      <Body>
        <Container>
          <Text className='font-bold text-3xl'>Hello {name}</Text>
          <Link href='https://example.com'>Click here to get started</Link>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeTemplate