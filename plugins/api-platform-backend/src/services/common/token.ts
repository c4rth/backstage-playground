import { AuthService } from "@backstage/backend-plugin-api";

// Helper to get catalog token
export async function getCatalogToken(auth: AuthService): Promise<string> {
  const { token } = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });
  return token;
}