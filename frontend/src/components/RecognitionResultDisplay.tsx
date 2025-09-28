import {
	Alert,
	Card,
	CardContent,
	CardMedia,
	Grid,
	Paper,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api, type RecognizeResponse } from "../api.ts";

interface RecognitionResultDisplayProps {
	recognitionResult: RecognizeResponse;
}

export const RecognitionResultDisplay = (
	props: RecognitionResultDisplayProps,
) => {
	const { recognitionResult } = props;
	const { t } = useTranslation();
	const [matchedImageUrl, setMatchedImageUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setError(null);
		api
			.getFaceImage(recognitionResult.matched_record.id)
			.then((imageUrl) => setMatchedImageUrl(imageUrl))
			.catch(() => {
				setMatchedImageUrl(null);
				setError(t("failedToLoadMatchedImage"));
			});
	}, [recognitionResult.matched_record.id, t]);

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				{t("recognitionResult")}
			</Typography>

			<Grid container spacing={3} alignItems="center">
				<Grid size={{ xs: 12, md: 6 }}>
					<Typography variant="body1" gutterBottom>
						<strong>{t("matchFound")}</strong>
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{t("label")}: {recognitionResult.matched_record.label}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{t("similarity")}:{" "}
						{(recognitionResult.cosine_similarity * 100).toFixed(0)}%
					</Typography>
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					{matchedImageUrl && (
						<MatchedFaceCard
							imageUrl={matchedImageUrl}
							label={recognitionResult.matched_record.label}
						/>
					)}
				</Grid>
			</Grid>

			{error && <Alert severity="warning">{error}</Alert>}
		</Paper>
	);
};

interface MatchedFaceCard {
	imageUrl: string;
	label: string;
}

const MatchedFaceCard = (props: MatchedFaceCard) => {
	const { imageUrl, label } = props;
	const { t } = useTranslation();
	return (
		<Card>
			<CardMedia
				component="img"
				height="200"
				image={imageUrl}
				alt={label}
				sx={{ objectFit: "contain" }}
			/>
			<CardContent>
				<Typography variant="body2" color="text.secondary" textAlign="center">
					{t("matchedFace")}
				</Typography>
			</CardContent>
		</Card>
	);
};
