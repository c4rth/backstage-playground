import { useEffect } from 'react';
import { useShadowRootElements } from '@backstage/plugin-techdocs-react';

export const CustomStylesAddon = () => {
  const [tabbedLabels] = useShadowRootElements(['.tabbed-labels']);

  useEffect(() => {
    if (!tabbedLabels) {
      console.log('tabbedLabels not found');
      return
    };
    console.log('tabbedLabels found');
    console.log(JSON.stringify(tabbedLabels));
    //.tabbed-labels>label
    //body.style.setProperty('.md-typeset .tabbed-labels>label font-size', '1rem');
        
    tabbedLabels.style.setProperty(
      'font-size',
      `3rem`,
    );
  }, [tabbedLabels]);

  // Nothing to render directly, so we can just return null.
  return null;
};