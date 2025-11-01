import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const plTranslations = {
	gallery: "Galeria",
	add: "Dodaj",
	recognize: "Rozpoznaj",
	faceRecognition: "Rozpoznawanie twarzy",
	uploadImage: "Prześlij obraz",
	webcamCapture: "Zrób zdjęcie",
	recognizing: "Rozpoznawanie",
	recognizeFace: "Rozpoznaj twarz",
	addNewFace: "Dodaj nową twarz",
	faceLabel: "Etykieta twarzy",
	faceLabelHelperText: "Nazwa lub identyfikator dla twarzy",
	uploadFace: "Prześlij twarz",
	chooseFile: "Wybierz plik",
	selected: "Wybrane",
	recognitionResult: "Wynik rozpoznawania",
	failedToLoadMatchImage: "Nie udało się załadować dopasowanego obrazu",
	matchFound: "Znaleziono dopasowanie",
	label: "Etykieta",
	similarity: "Podobieństwo",
	matchedFace: "Dopasowana twarz",
	capturePhoto: "Zrób zdjęcie",
	retakePhoto: "Zrób nowe zdjęcie",
	faceUploadedSuccessfully: "Twarz została pomyślnie zapisana",
	anErrorOccurredDuringUpload: "Wystąpił błąd podczas przesyłania",
};

const enTranslations = {
	gallery: "Gallery",
	add: "Add",
	recognize: "Recognize",
	faceRecognition: "Face Recognition",
	uploadImage: "Upload Image",
	webcamCapture: "Take Photo",
	recognizing: "Recognizing",
	recognizeFace: "Recognize Face",
	addNewFace: "Add New Face",
	faceLabel: "Face Label",
	faceLabelHelperText: "Name or identifier for the face",
	uploadFace: "Upload Face",
	chooseFile: "Choose File",
	selected: "Selected",
	recognitionResult: "Recognition Result",
	failedToLoadMatchImage: "Failed to load matched image",
	matchFound: "Match Found",
	label: "Label",
	similarity: "Similarity",
	matchedFace: "Matched Face",
	capturePhoto: "Capture Photo",
	retakePhoto: "Retake Photo",
	faceUploadedSuccessfully: "Face uploaded successfully",
	anErrorOccurredDuringUpload: "An error occurred during upload",
};

i18n.use(initReactI18next).init({
	resources: {
		en: {
			translation: enTranslations,
		},
		pl: {
			translation: plTranslations,
		},
	},
	lng: "pl",
	fallbackLng: "pl",
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
