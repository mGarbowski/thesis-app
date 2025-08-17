import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { UploadPage } from './pages/UploadPage';
import { WebcamPage } from './pages/WebcamPage';
import {RecognizePage} from "./pages/RecognizePage.tsx";

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Face Recognition App
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            to="/upload"
            variant={location.pathname === '/upload' ? 'outlined' : 'text'}
          >
            File Upload
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/webcam"
            variant={location.pathname === '/webcam' ? 'outlined' : 'text'}
          >
            Webcam Capture
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/recognize"
            variant={location.pathname === '/recognize' ? 'outlined' : 'text'}
          >
            Recognize
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/webcam" element={<WebcamPage />} />
          <Route path="/recognize" element={<RecognizePage />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;