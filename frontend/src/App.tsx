import {
	AppBar,
	Box,
	Button,
	Container,
	Toolbar,
	Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
	Link,
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
	useLocation,
} from "react-router-dom";
import { LanguageSelector } from "./components/LanguageSelector.tsx";
import { AddFacePage } from "./pages/AddFacePage.tsx";
import { GalleryPage } from "./pages/GalleryPage.tsx";
import { RecognizePage } from "./pages/RecognizePage.tsx";

const Navigation = () => {
	const location = useLocation();
	const { t } = useTranslation();

	return (
		<AppBar position="static">
			<Toolbar>
				<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					Face Recognition Demo
				</Typography>
				<LanguageSelector />
				<Box sx={{ display: "flex", gap: 2 }}>
					<Button
						color="inherit"
						component={Link}
						to="/add"
						variant={location.pathname === "/add" ? "outlined" : "text"}
					>
						{t("add")}
					</Button>
					<Button
						color="inherit"
						component={Link}
						to="/recognize"
						variant={location.pathname === "/recognize" ? "outlined" : "text"}
					>
						{t("recognize")}
					</Button>
					<Button
						color="inherit"
						component={Link}
						to="/gallery"
						variant={location.pathname === "/gallery" ? "outlined" : "text"}
					>
						{t("gallery")}
					</Button>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

const App = () => {
	return (
		<Router>
			<Navigation />
			<Container maxWidth="lg" sx={{ mt: 4 }}>
				<Routes>
					<Route path="/" element={<Navigate to="/recognize" replace />} />
					<Route path="/add" element={<AddFacePage />} />
					<Route path="/recognize" element={<RecognizePage />} />
					<Route path="/gallery" element={<GalleryPage />} />
				</Routes>
			</Container>
		</Router>
	);
};

export default App;
