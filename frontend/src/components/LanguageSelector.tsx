import { AppBar, Box, Button, Container, Toolbar, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link, Navigate, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";

const languages = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "pl", label: "PL", flag: "🇵🇱" },
];

export const LanguageSelector = () => {
    const { i18n } = useTranslation();

    return (
          <Select
            labelId="language-select-label"
            value={i18n.language}
            onChange={e => i18n.changeLanguage(e.target.value)}

          >
            {languages.map(lang => (
              <MenuItem key={lang.code} value={lang.code} sx={{color: "inherit"}}>
                <span style={{ marginRight: 8 }}>{lang.flag}</span>
                {lang.label}
              </MenuItem>
            ))}
          </Select>
    )
}