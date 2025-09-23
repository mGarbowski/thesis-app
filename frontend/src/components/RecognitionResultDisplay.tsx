import {api, type RecognizeResponse} from "../api.ts";
import React, {useEffect, useState} from "react";
import {Alert, Card, CardContent, CardMedia, Grid, Paper, Typography} from "@mui/material";

interface RecognitionResultDisplayProps {
    recognitionResult: RecognizeResponse;
}

export const RecognitionResultDisplay = (props: RecognitionResultDisplayProps) => {
    const {recognitionResult} = props;
    const [matchedImageUrl, setMatchedImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setError(null);
        api.getFaceImage(recognitionResult.matched_record.id)
            .then(imageUrl => setMatchedImageUrl(imageUrl))
            .catch(() => {
                setMatchedImageUrl(null)
                setError("Failed to load matched image");
            });
    }, [recognitionResult.matched_record.id]);

    return (
        <Paper sx={{p: 3}}>
            <Typography variant="h6" gutterBottom>
                Recognition Result
            </Typography>

            <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                    <Typography variant="body1" gutterBottom>
                        <strong>Match Found!</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Label: {recognitionResult.matched_record.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Similarity: {(recognitionResult.cosine_similarity * 100).toFixed(0)}%
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    {matchedImageUrl && (
                        <MatchedFaceCard imageUrl={matchedImageUrl} label={recognitionResult.matched_record.label}/>
                    )}
                </Grid>
            </Grid>

            {error && (
                <Alert severity="warning">
                    {error}
                </Alert>
            )}
        </Paper>
    );
}

interface MatchedFaceCard {
    imageUrl: string;
    label: string;
}

const MatchedFaceCard = (props: MatchedFaceCard) => {
    const {imageUrl, label} = props;
    return (
        <Card>
            <CardMedia
                component="img"
                height="200"
                image={imageUrl}
                alt={label}
                sx={{objectFit: 'contain'}}
            />
            <CardContent>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    Matched Face
                </Typography>
            </CardContent>
        </Card>
    );
}