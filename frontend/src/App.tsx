import './App.css'
import FaceUploadForm from "./FaceUploadForm.tsx";
import {WebcamFaceCapture} from "./WebcamFaceCapture.tsx";

function App() {

    return (
        <>
            <h1>Demo - praca dyplomowa inżynierska</h1>
            <h2>Mikołaj Garbowski</h2>
            <FaceUploadForm/>
            <WebcamFaceCapture/>
        </>
    )
}

export default App
