import React from 'react';
import { Typography, Box } from '@mui/material';
import { WebcamFaceCapture } from '../components/WebcamFaceCapture';

export const WebcamPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Capture Face from Webcam
      </Typography>
      <WebcamFaceCapture />
    </Box>
  );
};