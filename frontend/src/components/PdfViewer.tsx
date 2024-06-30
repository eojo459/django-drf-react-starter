import React, { useEffect } from 'react';

interface PDFViewerProps {
    url: string;
}

export default function PDFViewer(props: PDFViewerProps) {

    // props
    const url = props.url;

    // useEffect(() => {
    //     console.log("url="+url);
    // },[url]);

    return (
        <div>
            {/* <h1>PDF Viewer</h1> */}
            <iframe
                title="PDF Viewer"
                src={url}
                width="100%"
                height="800px"
                style={{ borderRadius:"10px" }}
            />
        </div>
    );
};
