import {type ChangeEvent, useRef} from 'react';
import {Box, Button, Typography} from '@mui/material';
import {Upload} from '@mui/icons-material';

interface ImageUploadProps {
    selectedFile: File | null;
    onUpload: (file: File) => void;
}

export const ImageUpload = (props: ImageUploadProps) => {
    const {selectedFile, onUpload} = props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <Box textAlign="center">
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{display: 'none'}}
            />
            <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<Upload/>}
                sx={{mb: 2}}
            >
                Choose Image File
            </Button>
            {selectedFile && (
                <SelectedFileDisplay file={selectedFile}/>
            )}
        </Box>
    );
}

interface SelectedFileDisplayProps {
    file: File;
}

const SelectedFileDisplay = (props: SelectedFileDisplayProps) => {
    const {file} = props;

    return (
        <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
                Selected: {file.name}
            </Typography>
            <Box mt={2}>
                <img
                    src={URL.createObjectURL(file)}
                    alt="Selected"
                    style={{maxWidth: '100%', maxHeight: '300px', objectFit: 'contain'}}
                />
            </Box>
        </Box>
    );
}