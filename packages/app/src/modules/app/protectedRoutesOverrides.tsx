import catalogPlugin from '@backstage/plugin-catalog/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';

export const catalogPluginProtected = catalogPlugin.withOverrides({
  extensions: [
    catalogPlugin.getExtension('page:catalog').override({
      if: {
        permissions: {
          $contains: 'app.notGuest',
        },
      },
    }),
  ],
});

export const scaffolderPluginProtected = scaffolderPlugin.withOverrides({
  extensions: [
    scaffolderPlugin.getExtension('page:scaffolder').override({
      if: {
        permissions: {
          $contains: 'app.notGuest',
        },
      },
    }),
  ],
});
