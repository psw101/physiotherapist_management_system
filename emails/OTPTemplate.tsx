import React from 'react';
import {
  Html,
  Body,
  Container,
  Text,
  Link,
  Preview,
  Heading,
  Section,
  Button,
  Hr,
  Tailwind
} from '@react-email/components';

interface OTPTemplateProps {
  name: string;
  otp: string;
}

const OTPTemplate = ({ name, otp }: OTPTemplateProps) => {
  return (
    <Html>
      <Preview>Your password reset code: {otp}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white p-8 rounded-lg shadow-lg my-8 mx-auto max-w-md">
            <Heading className="text-2xl font-bold text-center text-indigo-600 mb-4">
              Password Reset Request
            </Heading>
            
            <Text className="text-gray-700 mb-4">
              Hello {name},
            </Text>
            
            <Text className="text-gray-700 mb-4">
              We received a request to reset your password for your PhysioApp account. Please use the following verification code to complete your password reset:
            </Text>
            
            <Section className="bg-gray-100 p-4 rounded-md text-center mb-6">
              <Text className="font-bold text-3xl tracking-wide text-indigo-600">{otp}</Text>
            </Section>
            
            <Text className="text-gray-700 mb-4">
              This code will expire in 15 minutes. If you did not request a password reset, please ignore this email or contact our support team if you have concerns.
            </Text>
            
            <Hr className="border-gray-300 my-6" />
            
            <Text className="text-sm text-gray-600 text-center">
              If you're having trouble with the code, you can also reset your password by clicking the button below:
            </Text>
            
            <Section className="text-center my-4">
              <Button
                className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-md"
                href="https://physioapp.com/reset-password"
              >
                Reset Password
              </Button>
            </Section>
            
            <Text className="text-xs text-gray-500 mt-8 text-center">
              © 2025 PhysioApp. All rights reserved.
              <br />
              123 Therapy Lane, Medical District, CA 90210
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OTPTemplate;