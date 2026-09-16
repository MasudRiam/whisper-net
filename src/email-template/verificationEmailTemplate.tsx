import { Html, Head, Preview, Body, Container, Text, Heading } from '@react-email/components';
import * as React from 'react';

interface OtpEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmailTemplate({ username, otp }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your OTP code is {otp}</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px' }}>
          <Heading style={{ color: '#333333' }}>Hello, {username} 👋</Heading>
          <Text style={{ fontSize: '16px', color: '#555555' }}>
            Use the OTP below to continue:
          </Text>
          <Text
            style={{
              fontSize: '32px',
              color: '#007bff',
              fontWeight: 'bold',
              textAlign: 'center',
              margin: '20px 0',
              letterSpacing: '4px',
            }}
          >
            {otp}
          </Text>
          <Text style={{ fontSize: '14px', color: '#888888' }}>
            This code will expire in 5 minutes. Please don’t share it with anyone.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
