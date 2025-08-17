import React, {useCallback, useRef, useState} from 'react';
import Webcam from "react-webcam";
import {Alert, Box, Button, CircularProgress, Paper, TextField, Typography} from '@mui/material';
import {CameraAlt, Refresh, Upload} from '@mui/icons-material';

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
};

interface UploadResponse {
    id: string;
    filename: string;
    label: string;
    message: string;
}

export const WebcamFaceCapture: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [label, setLabel] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            setError(null);
        } else {
            setError('Failed to capture image');
        }
    }, []);

    const retake = useCallback(() => {
        setCapturedImage(null);
        setSuccess(null);
        setError(null);
    }, []);

    const dataURLtoBlob = (dataurl: string): Blob => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type: mime});
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!capturedImage || !label.trim()) {
            setError('Please capture an image and enter a label');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const blob = dataURLtoBlob(capturedImage);
            const formData = new FormData();
            formData.append('file', blob, 'webcam_capture.jpg');
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
            setCapturedImage(null);
            setLabel('');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{p: 3, maxWidth: 600, mx: 'auto'}}>
            <Typography variant="h5" component="h2" gutterBottom>
                Capture Face from Webcam
            </Typography>

            <Box sx={{mt: 2}}>
                {/* Camera/Image Display */}
                <Box sx={{position: 'relative', mb: 2, textAlign: 'center'}}>
                    {!capturedImage ? (
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            height={480}
                            width={640}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            style={{
                                border: '2px solid #ccc',
                                borderRadius: '8px'
                            }}
                        />
                    ) : (
                        <img
                            src={capturedImage}
                            alt="Captured face"
                            style={{
                                width: '640px',
                                height: '480px',
                                border: '2px solid #ccc',
                                borderRadius: '8px',
                                objectFit: 'cover'
                            }}
                        />
                    )}
                </Box>

                {/* Camera Controls */}
                <Box sx={{mb: 2, display: 'flex', gap: 1, justifyContent: 'center'}}>
                    {!capturedImage ? (
                        <Button
                            variant="contained"
                            startIcon={<CameraAlt/>}
                            onClick={capture}
                        >
                            Capture Photo
                        </Button>
                    ) : (
                        <Button
                            variant="outlined"
                            startIcon={<Refresh/>}
                            onClick={retake}
                        >
                            Retake Photo
                        </Button>
                    )}
                </Box>

                {/* Form */}
                {capturedImage && (
                    <Box component="form" onSubmit={handleSubmit}>
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
                            disabled={loading || !label.trim()}
                            startIcon={loading ? <CircularProgress size={16}/> : <Upload/>}
                            sx={{mt: 2}}
                        >
                            {loading ? 'Uploading...' : 'Upload Face'}
                        </Button>
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{mt: 2}}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{mt: 2}}>
                        {success}
                    </Alert>
                )}
            </Box>
        </Paper>
    );
};