export function FileDownload(fileUrl: string, fileName: string) {
    // create an anchor element
    const link = document.createElement('a');
    link.href = fileUrl;
    //link.target = "_blank"; // open link in a new tab
    link.download = fileName;
    
    // programmatically trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};