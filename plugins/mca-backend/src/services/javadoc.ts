import * as cheerio from 'cheerio';
import {
  InputError,
  NotFoundError,
  ServiceUnavailableError,
} from '@backstage/errors';
import { McaJavadocAsset } from './types';

type McaBaseTypeJavadocRequest = {
  baseType: string;
  packageName: string;
};

type JavadocDocument = ReturnType<typeof cheerio.load>;

function getJavadocAssetContentType(path: string): string | undefined {
  const extension = path.split('.').pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    css: 'text/css',
    gif: 'image/gif',
    ico: 'image/x-icon',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    js: 'application/javascript',
    png: 'image/png',
    svg: 'image/svg+xml',
  };

  return extension ? contentTypes[extension] : undefined;
}

function getSourceUrl(
  request: McaBaseTypeJavadocRequest,
  baseTypesUrl: string,
): URL {
  if (
    !/^[\w.]+$/.test(request.packageName) ||
    !/^[\w$]+$/.test(request.baseType)
  ) {
    throw new InputError('Invalid Javadoc path');
  }

  return new URL(
    `${request.packageName.replace(/\./g, '/')}/${request.baseType}.html`,
    `${baseTypesUrl}/`,
  );
}

async function fetchJavadoc(sourceUrl: URL): Promise<string> {
  let response: Response;
  try {
    response = await fetch(sourceUrl);
  } catch (error) {
    throw new ServiceUnavailableError('Failed to fetch Javadoc', error);
  }
  if (response.status === 404) {
    throw new NotFoundError(`Javadoc not found at ${sourceUrl}`);
  }
  if (!response.ok) {
    throw new ServiceUnavailableError(
      `Failed to fetch Javadoc: ${response.status} ${response.statusText}`,
    );
  }

  try {
    return await response.text();
  } catch (error) {
    throw new ServiceUnavailableError('Failed to read Javadoc response', error);
  }
}

function removeNavigation($: JavadocDocument): void {
  $('.skipNav, .topNav, .navList, .subNav, .bottomNav').remove();
}

function removeTags($: JavadocDocument): void {
  $('head title').remove();
}

function rewriteBaseTypeLinks(
  $: JavadocDocument,
  sourceUrl: URL,
  appBaseUrl: string,
): void {
  $('a[href]').each((_index, element) => {
    const href = $(element).attr('href');
    if (!href) return;

    const linkUrl = new URL(href, sourceUrl);
    const match = linkUrl.pathname.match(
      /\/(?:javadoc|basetypes)\/dexia\/opmk\/basetypes\/.+\/(?:([^/]+)\.html|(dexia\.opmk\.basetypes(?:\.[\w$]+)+))$/,
    );
    const linkedBaseType = match?.[1] ?? match?.[2]?.split('.').pop();
    if (!linkedBaseType) return;

    $(element).attr(
      'href',
      `${appBaseUrl}/mca/basetypes/${encodeURIComponent(linkedBaseType)}`,
    );
    $(element).attr('data-mca-basetype', linkedBaseType);
  });
}

function appendNavigationHandler($: JavadocDocument, appBaseUrl: string): void {
  $('body').append(`
    <script>
      document.addEventListener('click', function (event) {
        var link = event.target.closest('a[data-mca-basetype]');
        if (!link) return;
        event.preventDefault();
        parent.postMessage(
          { type: 'mca-basetype-navigation', baseType: link.dataset.mcaBasetype },
          ${JSON.stringify(appBaseUrl)},
        );
      });
    </script>
  `);
}

function rewriteAssetUrls(
  $: JavadocDocument,
  sourceUrl: URL,
  baseTypesUrl: string,
): void {
  $('link[href], script[src], img[src]').each((_index, element) => {
    const attribute = element.tagName === 'link' ? 'href' : 'src';
    const assetUrl = $(element).attr(attribute);
    if (!assetUrl) return;

    const resolvedUrl = new URL(assetUrl, sourceUrl);
    if (!resolvedUrl.href.startsWith(`${baseTypesUrl}/`)) return;

    $(element).attr(
      attribute,
      `/api/mca/basetypes/javadoc/assets?path=${encodeURIComponent(
        resolvedUrl.href.slice(`${baseTypesUrl}/`.length),
      )}`,
    );
  });
}

export async function getMcaBaseTypeJavadoc(
  request: McaBaseTypeJavadocRequest,
  baseTypesUrl: string,
  appBaseUrl: string,
): Promise<string> {
  const sourceUrl = getSourceUrl(request, baseTypesUrl);
  const $ = cheerio.load(await fetchJavadoc(sourceUrl));
  removeNavigation($);
  removeTags($);
  rewriteBaseTypeLinks($, sourceUrl, appBaseUrl);
  appendNavigationHandler($, appBaseUrl);
  rewriteAssetUrls($, sourceUrl, baseTypesUrl);
  return $.html();
}

export async function getMcaBaseTypeJavadocAsset(
  request: { path: string },
  baseTypesUrl: string,
): Promise<McaJavadocAsset> {
  if (request.path.startsWith('/') || request.path.includes('..')) {
    throw new InputError('Invalid Javadoc asset path');
  }

  const sourceUrl = new URL(request.path, `${baseTypesUrl}/`);
  if (!sourceUrl.href.startsWith(`${baseTypesUrl}/`)) {
    throw new InputError('Invalid Javadoc asset path');
  }

  let response: Response;
  try {
    response = await fetch(sourceUrl);
  } catch (error) {
    throw new ServiceUnavailableError('Failed to fetch Javadoc asset', error);
  }
  if (response.status === 404) {
    throw new NotFoundError(`Javadoc asset not found: ${request.path}`);
  }
  if (!response.ok) {
    throw new ServiceUnavailableError(
      `Failed to fetch Javadoc asset: ${response.status} ${response.statusText}`,
    );
  }

  let content: Buffer;
  try {
    content = Buffer.from(await response.arrayBuffer());
  } catch (error) {
    throw new ServiceUnavailableError(
      'Failed to read Javadoc asset response',
      error,
    );
  }

  return {
    content,
    contentType:
      getJavadocAssetContentType(request.path) ??
      response.headers.get('content-type') ??
      undefined,
  };
}
