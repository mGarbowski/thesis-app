import { Box, CircularProgress, Pagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { api, apiUrls, type FaceRecord } from "../api";
import { useTranslation } from "react-i18next";

export const GalleryPage = () => {
	const { t } = useTranslation();

	const pageSize = 20;
	const [page, setPage] = useState(1);
	const [faces, setFaces] = useState<FaceRecord[]>([]);
	const [totalFaces, setTotalFaces] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const totalPages = Math.ceil(totalFaces / pageSize);

	useEffect(() => {
		const fetchFaces = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await api.getFaces(page, pageSize);
				setFaces(data.faces);
				setTotalFaces(data.count);
			} catch (err) {
				setError((err as Error).message);
			} finally {
				setLoading(false);
			}
		};

		fetchFaces();
	}, [page]);

	return (
		<Box maxWidth={1200} mx="auto" my={4} px={2}>
			<Typography variant="h4" component="h1" gutterBottom textAlign="center">
				{t("gallery")}
			</Typography>

			{error && <Typography color="error">{error}</Typography>}
			{loading && (
				<Box display="flex" justifyContent="center" my={4}>
					<CircularProgress />
				</Box>
			)}

			{!loading && !error && faces.length === 0 && (
				<Typography>No faces found. Please add some faces first.</Typography>
			)}

			{!loading && !error && faces.length > 0 && (
				<Box>
					<Gallery faces={faces} />
					<Box display="flex" justifyContent="center" mt={4}>
						<Pagination
							count={totalPages}
							page={page}
							onChange={(_, value) => setPage(value)}
						/>
					</Box>
				</Box>
			)}
		</Box>
	);
};

interface GalleryProps {
	faces: FaceRecord[];
}

const Gallery = (props: GalleryProps) => {
	const { faces } = props;

	return (
		<Box
			display="grid"
			gridTemplateColumns="repeat(5, 1fr)"
			gridTemplateRows="repeat(4, 1fr)"
			gap={2}
			height="80vh"
			maxHeight="80vh"
		>
			{faces.slice(0, 20).map((face) => (
				<ImageCard key={face.id} face={face} />
			))}
		</Box>
	);
};

interface ImageCardProps {
	face: FaceRecord;
}

const ImageCard = (props: ImageCardProps) => {
	const { face } = props;
	const src = apiUrls.getImage(face.id);

	return (
		<Box
			border={1}
			borderRadius={2}
			overflow="hidden"
			width="100%"
			height="100%"
			display="flex"
			flexDirection="column"
		>
			<Box flex="1 1 auto" position="relative" minHeight={0}>
				<img
					src={src}
					alt={face.label}
					style={{
						width: "100%",
						height: "100%",
						objectFit: "cover",
						display: "block",
						aspectRatio: "1 / 1",
					}}
				/>
			</Box>
			<Box
				p={1}
				bgcolor="background.paper"
				minHeight={36}
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<Typography variant="body2" noWrap>
					{face.label}
				</Typography>
			</Box>
		</Box>
	);
};
