import { useEffect, useState } from 'react';
import { useTechDocsReaderPage } from '@backstage/plugin-techdocs-react';
import { DrawIoProps } from './props';

export const DrawIoAddOn = ({ 
        enableEdit= false, 
        enablePrint= false,
        enableLightbox= true,
        drawIoUrl = 'https://viewer.diagrams.net/js/viewer-static.min.js'
    }: DrawIoProps) => {

    const { shadowRoot } = useTechDocsReaderPage();
    const [loaded, setLoaded] = useState<boolean>(false);

    // --- Remove Edit and Print buttons ---
    const observer = new MutationObserver(() => {
        if (!enableEdit) document.querySelectorAll('[title="Edit"]').forEach(el => el.remove());
        if (!enablePrint) document.querySelectorAll('[title="Print"]').forEach(el => el.remove());
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // --- Monkey patch getComputedStyle ---
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = (el: Element) => {
        if (!(el instanceof Element)) return {} as CSSStyleDeclaration;
        return originalGetComputedStyle(el);
    };

     // --- Prevent auto-scan of document by draw.io ---
    const originalQuerySelectorAll = document.querySelectorAll;
    document.querySelectorAll = (selectors: string) => {
      if (selectors.includes(".mxgraph")) return [] as any;
      return originalQuerySelectorAll.call(document, selectors);
    };

    useEffect(() => {
        if (!shadowRoot || loaded) return undefined;

        let script: HTMLScriptElement;

        // Load the draw.io viewer script
        const loadScript = () =>
            new Promise<void>((resolve) => {
                if ((window as any).GraphViewer) {
                    resolve();
                    return;
                }
                script = document.createElement("script");
                script.src = drawIoUrl;
                script.async = true;
                script.onload = () => resolve();
                document.body.appendChild(script);
            });

        loadScript().then(() => {            
            document.querySelectorAll = originalQuerySelectorAll;
            if ((window as any).GraphViewer) {
                const divs = shadowRoot.querySelectorAll<HTMLDivElement>('div.mxgraph');
                // Generate viewer instances for each div mxgraph
                divs.forEach((div, _) => {
                    if (div.hasAttribute('data-mxgraph')) {
                        (window as any).GraphViewer.createViewerForElement(div, (viewer: any) => {
                            viewer.lightboxClickEnabled = enableLightbox;
                        });
                    }
                });
            }
        });

        setLoaded(true);

        return () => {
            if (script) document.body.removeChild(script);
            window.getComputedStyle = originalGetComputedStyle;
        }

    }, [shadowRoot, loaded, originalGetComputedStyle, originalQuerySelectorAll, drawIoUrl, enableLightbox]);


    return null
};