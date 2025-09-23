import React, { useState, useRef, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import {
  CameraAlt,
  Upload,
  Search,
  PhotoCamera
} from '@mui/icons-material';
import Webcam from 'react-webcam';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index} = props;
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const RecognizePage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchedResult, setMatchedResult] = useState<any>(null);
  const [matchedImageUrl, setMatchedImageUrl] = useState<string | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (_: any, newValue: number) => {
    setTabValue(newValue);
    setSelectedFile(null);
    setCapturedImage(null);
    setError(null);
    setMatchedResult(null);
    setMatchedImageUrl(null);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setError(null);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleRecognize = async () => {
    setIsLoading(true);
    setError(null);
    setMatchedResult(null);
    setMatchedImageUrl(null);

    try {
      const formData = new FormData();

      if (tabValue === 0 && selectedFile) {
        formData.append('file', selectedFile);
      } else if (tabValue === 1 && capturedImage) {
        const file = dataURLtoFile(capturedImage, 'webcam-capture.jpg');
        formData.append('file', file);
      } else {
        setError('Please select an image or capture one from webcam');
        return;
      }

      const response = await fetch('http://localhost:8000/recognize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Recognition failed');
      }

      const result = await response.json();
      setMatchedResult(result);

      // Fetch the matched image
      if (result.matched_record?.id) {
        const imageResponse = await fetch(`http://localhost:8000/faces/${result.matched_record.id}/image`);
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          setMatchedImageUrl(imageUrl);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during recognition');
    } finally {
      setIsLoading(false);
    }
  };

  const canRecognize = (tabValue === 0 && selectedFile) || (tabValue === 1 && capturedImage);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Face Recognition
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Upload Image" icon={<Upload />} />
          <Tab label="Webcam Capture" icon={<CameraAlt />} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box textAlign="center">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<Upload />}
              sx={{ mb: 2 }}
            >
              Choose Image File
            </Button>
            {selectedFile && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Selected: {selectedFile.name}
                </Typography>
                <Box mt={2}>
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected"
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box textAlign="center">
            {!capturedImage ? (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  style={{ maxWidth: '500px', borderRadius: '8px' }}
                />
                <Box mt={2}>
                  <Button
                    variant="contained"
                    onClick={captureImage}
                    startIcon={<PhotoCamera />}
                  >
                    Capture Photo
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <img
                  src={capturedImage}
                  alt="Captured"
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }}
                />
                <Box mt={2}>
                  <Button variant="outlined" onClick={retakePhoto} sx={{ mr: 2 }}>
                    Retake Photo
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </TabPanel>
      </Paper>

      <Box textAlign="center" mb={3}>
        <Button
          variant="contained"
          size="large"
          onClick={handleRecognize}
          disabled={!canRecognize || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Search />}
        >
          {isLoading ? 'Recognizing...' : 'Recognize Face'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {matchedResult && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recognition Result
          </Typography>

          {matchedResult.matched_record ? (
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="body1" gutterBottom>
                  <strong>Match Found!</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Label: {matchedResult.matched_record.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Similarity: {(matchedResult.cosine_similarity * 100).toFixed(0)}%
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                {matchedImageUrl && (
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={matchedImageUrl}
                      alt="Matched face"
                      sx={{ objectFit: 'contain' }}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Matched Face
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          ) : (
            <Alert severity="warning">
              No matching face found in the database
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );
};

interface RecognitionResultDisplayProps {}

const RecognitionResultDisplay = (props: RecognitionResultDisplayProps) => {
    return <div>RecognitionResultDisplay</div>;
}

interface ImageUploadTabProps {}

const ImageUploadTab = (props: ImageUploadTabProps) => {
    return <div>Image Upload</div>;
}

interface WebcamCaptureTabProps {}

const WebcamCaptureTab = (props: WebcamCaptureTabProps) => {
    return <div>Webcam Capture</div>;
}