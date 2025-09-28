import {Box, Typography} from "@mui/material";

export const GalleryPage = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                Gallery
            </Typography>
            <img src="http://localhost:8000/api/faces/d589344f-74c8-4ad5-bf18-4d59746b06df/image"/>
        </Box>
    );
}