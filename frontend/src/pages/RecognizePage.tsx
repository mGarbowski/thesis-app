import React, {useState} from 'react';
import {Alert, Box, Button, CircularProgress, Paper, Tab, Tabs, Typography} from '@mui/material';
import {CameraAlt, Search, Upload} from '@mui/icons-material';
import {ImageUpload} from "../components/ImageUpload.tsx";
import {RecognitionResultDisplay} from "../components/RecognitionResultDisplay.tsx";
import {WebcamCapture} from "../components/WebcamCapture.tsx";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps) => {
    const {children, value, index} = props;
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{p: 3}}>{children}</Box>}
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


    const handleTabChange = (_: any, newValue: number) => {
        setTabValue(newValue);
        setSelectedFile(null);
        setCapturedImage(null);
        setError(null);
        setMatchedResult(null);
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
        return new File([u8arr], filename, {type: mime});
    };

    const handleRecognize = async () => {
        setIsLoading(true);
        setError(null);
        setMatchedResult(null);

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

