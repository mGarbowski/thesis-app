import React from 'react';
import { Typography, Box } from '@mui/material';
import { FaceUploadForm } from '../components/FaceUploadForm';

export const UploadPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Upload Face Image
      </Typography>
      <FaceUploadForm />
    </Box>
  );
};