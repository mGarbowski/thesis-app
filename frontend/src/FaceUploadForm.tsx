import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

interface UploadResponse {
  id: string;
  filename: string;
  label: string;
  message: string;
}

const FaceUploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file || !label.trim()) {
      setError('Please select a file and enter a label');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('label', label.trim());

      const response = await fetch('http://localhost:8000/upload-face', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result: UploadResponse = await response.json();
      setSuccess(`Face uploaded successfully: ${result.filename}`);
      setFile(null);
      setLabel('');

      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Upload Face Image
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
          fullWidth
          sx={{ mb: 2, p: 2 }}
        >
          {file ? file.name : 'Select Image File'}
          <input
            id="file-input"
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </Button>

        <TextField
          fullWidth
          label="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          margin="normal"
          required
          disabled={loading}
          helperText="Enter a label to identify this face"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || !file || !label.trim()}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload Face'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default FaceUploadForm;