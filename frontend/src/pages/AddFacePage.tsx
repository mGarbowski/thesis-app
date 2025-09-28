import {useState} from "react";
import {Alert, Box, Button, CircularProgress, Paper, Tab, Tabs, TextField, Typography} from "@mui/material";
import {CameraAlt, Upload} from "@mui/icons-material";
import {TabPanel} from "../components/TabPanel.tsx";
import {ImageUpload} from "../components/ImageUpload.tsx";
import {WebcamCapture} from "../components/WebcamCapture.tsx";
import {dataURLtoFile, generateWebcamCaptureFilename} from "../utils.ts";
import {api} from "../api.ts";
import {useTranslation} from "react-i18next";

export const AddFacePage = () => {
    const {t} = useTranslation();

    const [tabValue, setTabValue] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [label, setLabel] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleTabChange = (_: any, newValue: number) => {
        setTabValue(newValue);
        setSelectedFile(null);
        setCapturedImage(null);
        setError(null);
    };

    const isFaceSelected = (tabValue === 0 && selectedFile != null) || (tabValue === 1 && capturedImage != null);
    const canSubmit = !isLoading && isFaceSelected && label.trim() !== "";

    const handleSubmit = async () => {
        if (!canSubmit) {
            return;
        }

        const file = selectedFile
            ? selectedFile
            : dataURLtoFile(capturedImage!, generateWebcamCaptureFilename());

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await api.uploadFace(file, label.trim());
            setSuccess(`${t("faceUploadedSuccessfully")} - ${result.filename}`);
            setSelectedFile(null);
            setCapturedImage(null);
            setLabel('');
        } catch (err) {
            setError(err instanceof Error ? err.message : t("anErrorOccurredDuringUpload"));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                {t("addNewFace")}
            </Typography>

            <Paper sx={{mb: 3}}>
                <Tabs value={tabValue} onChange={handleTabChange} centered>
                    <Tab label={t("uploadImage")} icon={<Upload/>}/>
                    <Tab label={t("webcamCapture")} icon={<CameraAlt/>}/>
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <ImageUpload selectedFile={selectedFile} onUpload={setSelectedFile}/>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <WebcamCapture capturedImageUrl={capturedImage} setCapturedImageUrl={setCapturedImage}/>
                </TabPanel>
            </Paper>

            <Paper sx={{p: 3, mx: "auto"}}>
                <Box sx={{maxWidth: 400, mx: "auto"}}>
                    <TextField
                        label={t("faceLabel")}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        margin="normal"
                        required
                        disabled={isLoading}
                        helperText={t("faceLabelHelperText")}
                        variant="outlined"
                        fullWidth
                    />

                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!canSubmit}
                        sx={{height: 48, fontSize: 16}}
                        fullWidth
                    >
                        {isLoading ? <CircularProgress size={24}/> : t("uploadFace")}
                    </Button>
                </Box>

            </Paper>

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
    );
}