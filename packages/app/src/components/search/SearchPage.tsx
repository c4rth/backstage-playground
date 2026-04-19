import { Grid, Card, CardBody } from '@backstage/ui';
import { CatalogSearchResultListItem } from '@backstage/plugin-catalog';
import {
  catalogApiRef,
  CATALOG_FILTER_EXISTS,
} from '@backstage/plugin-catalog-react';
import { TechDocsSearchResultListItem } from '@backstage/plugin-techdocs';

import { SearchType } from '@backstage/plugin-search';
import {
  SearchBar,
  SearchFilter,
  SearchResult,
  SearchPagination,
  useSearch,
} from '@backstage/plugin-search-react';
import {
  CatalogIcon,
  Content,
  DocsIcon,
  Header,
  Page,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { ApiSearchResultListItem } from '@internal/plugin-api-platform';
import { McaComponentSearchResultListItem } from '@internal/plugin-mca';
import { RiBubbleChartLine, RiCodeFill } from '@remixicon/react';

const SearchPage = () => {
  const { types } = useSearch();
  const catalogApi = useApi(catalogApiRef);

  return (
    <Page themeId="home">
      <Header title="Search" />
      <Content>
        <Grid.Root columns="12">
          <Grid.Item colSpan="12">
            <Card>
              <CardBody>
                <SearchBar />
              </CardBody>
            </Card>
          </Grid.Item>
          <Grid.Item colSpan="3">
            <SearchType.Accordion
              name="Result Type"
              defaultValue=""
              types={[
                {
                  value: 'software-catalog',
                  name: 'Catalog',
                  icon: <CatalogIcon />,
                },
                {
                  value: 'techdocs',
                  name: 'Documentation',
                  icon: <DocsIcon />,
                },
                {
                  value: 'mca',
                  name: 'MCA Components',
                  icon: <RiCodeFill />,
                },
              ]}
            />
            {types.includes('techdocs') && (
              <Card style={{ marginTop: '16px' }}>
                <CardBody>
                  <SearchFilter.Select
                    label="Entity"
                    name="name"
                    values={async () => {
                      // Return a list of entities which are documented.
                      const { items } = await catalogApi.getEntities({
                        fields: ['metadata.name'],
                        filter: {
                          'metadata.annotations.backstage.io/techdocs-ref':
                            CATALOG_FILTER_EXISTS,
                        },
                      });

                      const names = items.map(entity => entity.metadata.name);
                      names.sort();
                      return names;
                    }}
                  />
                </CardBody>
              </Card>
            )}
          </Grid.Item>
          <Grid.Item colSpan="9">
            <SearchPagination />
            <SearchResult>
              <ApiSearchResultListItem icon={<CatalogIcon />} />
              <McaComponentSearchResultListItem icon={<RiBubbleChartLine />} />
              <CatalogSearchResultListItem icon={<CatalogIcon />} />
              <TechDocsSearchResultListItem icon={<DocsIcon />} />
            </SearchResult>
          </Grid.Item>
        </Grid.Root>
      </Content>
    </Page>
  );
};

export const searchPage = <SearchPage />;
