import { FormControl, MenuItem, Select } from "@mui/material";
import { useTranslation } from "react-i18next";

const languages = [
	{ code: "en", label: "EN", flag: "🇬🇧" },
	{ code: "pl", label: "PL", flag: "🇵🇱" },
];

export const LanguageSelector = () => {
	const { i18n } = useTranslation();

	return (
		<FormControl variant="standard" sx={{ minWidth: 80, mr: 2 }}>
			<Select
				value={i18n.language}
				onChange={(e) => i18n.changeLanguage(e.target.value)}
				disableUnderline
				sx={{
					color: "#fff",
					"& .MuiSvgIcon-root": { color: "#fff" },
					"& .MuiInputBase-input": { color: "#fff" },
					"&:focus": { background: "none" },
				}}
			>
				{languages.map((lang) => (
					<MenuItem key={lang.code} value={lang.code}>
						<span style={{ marginRight: 8 }}>{lang.flag}</span>
						{lang.label}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};
