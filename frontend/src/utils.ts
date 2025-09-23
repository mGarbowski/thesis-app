export const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
};

export const generateWebcamCaptureFilename = (): string => {
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '');
    return `webcam_capture_${timestamp}.jpg`;
}