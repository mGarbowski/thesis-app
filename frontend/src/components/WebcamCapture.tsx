import {useRef} from "react";
import Webcam from "react-webcam";
import {Box, Button} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";

interface WebcamCaptureProps {
    capturedImageUrl: string | null;
    setCapturedImageUrl: (image: string | null) => void;
}

export const WebcamCapture = (props: WebcamCaptureProps) => {
    const {capturedImageUrl, setCapturedImageUrl} = props;

    const handleCaptureImage = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImageUrl(imageSrc);
        }
    };

    const handleRetakePhoto = () => {
        setCapturedImageUrl(null);
    };

    const webcamRef = useRef<Webcam>(null);

    const webcam = () => (
        <>
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                width="100%"
                style={{maxWidth: '500px', borderRadius: '8px'}}
            />
            <Box mt={2}>
                <Button
                    variant="contained"
                    onClick={handleCaptureImage}
                    startIcon={<PhotoCamera/>}
                >
                    Capture Photo
                </Button>
            </Box>
        </>
    )

    const capturedImage = () => (
        <>
            <img
                src={capturedImageUrl!}
                alt="Captured"
                style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px'
                }}
            />
            <Box mt={2}>
                <Button variant="outlined" onClick={handleRetakePhoto} sx={{mr: 2}}>
                    Retake Photo
                </Button>
            </Box>
        </>
    )
    return (
        <Box textAlign="center">
            {!capturedImageUrl
                ? webcam()
                : capturedImage()
            }
        </Box>
    );
}