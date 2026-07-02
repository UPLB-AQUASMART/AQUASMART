import Script from "next/script";

import { VIEWER_IMPORT_MAP } from "./constants";

export function ViewerScripts() {
  return (
    <>
      <script
        type="importmap"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(VIEWER_IMPORT_MAP),
        }}
      />
      <Script
        src="/groundwater-viewer/scripts/groundwater-viewer-app.js"
        strategy="afterInteractive"
        type="module"
      />
    </>
  );
}
