import {useState} from 'react';
import {Alert, Box, Button, CircularProgress, Paper, Tab, Tabs, Typography} from '@mui/material';
import {CameraAlt, Search, Upload} from '@mui/icons-material';
import {ImageUpload} from "../components/ImageUpload.tsx";
import {RecognitionResultDisplay} from "../components/RecognitionResultDisplay.tsx";
import {WebcamCapture} from "../components/WebcamCapture.tsx";
import {dataURLtoFile, generateWebcamCaptureFilename} from "../utils.ts";
import {api} from "../api.ts";
import {TabPanel} from '../components/TabPanel.tsx';


export const RecognizePage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [matchedResult, setMatchedResult] = useState<any>(null);


    const handleTabChange = (_: any, newValue: number) => {
        setTabValue(newValue);
        setSelectedFile(null);
        setCapturedImage(null);
        setError(null);
        setMatchedResult(null);
    };


    const handleRecognize = async () => {
        if (!selectedFile && !capturedImage) {
            setError('Please select an image or capture one from webcam');
            return;
        }

        setIsLoading(true);
        setError(null);
        setMatchedResult(null);


        try {
            const faceFile = selectedFile
                ? selectedFile
                : dataURLtoFile(capturedImage!, generateWebcamCaptureFilename());

            const recognitionResult = await api.recognizeImage(faceFile);
            setMatchedResult(recognitionResult);

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

            <Paper sx={{mb: 3}}>
                <Tabs value={tabValue} onChange={handleTabChange} centered>
                    <Tab label="Upload Image" icon={<Upload/>}/>
                    <Tab label="Webcam Capture" icon={<CameraAlt/>}/>
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <ImageUpload selectedFile={selectedFile} onUpload={setSelectedFile}/>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <WebcamCapture capturedImageUrl={capturedImage} setCapturedImageUrl={setCapturedImage}/>
                </TabPanel>
            </Paper>

            <Box textAlign="center" mb={3}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleRecognize}
                    disabled={!canRecognize || isLoading}
                    startIcon={isLoading ? <CircularProgress size={20}/> : <Search/>}
                >
                    {isLoading ? 'Recognizing...' : 'Recognize Face'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{mb: 3}}>
                    {error}
                </Alert>
            )}

            {matchedResult && (
                <RecognitionResultDisplay recognitionResult={matchedResult}/>
            )}
        </Box>
    );
};

