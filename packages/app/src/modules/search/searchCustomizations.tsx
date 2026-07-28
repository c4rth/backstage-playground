import {
    createExtensionInput,
    createFrontendModule,
    PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { searchPlugin } from '@backstage/plugin-search';
import { McaSearchResultListItemExtension } from "@internal/plugin-mca";
import { ApiSearchResultListItemExtension } from "@internal/plugin-api-platform";
import { SearchResultListItemBlueprint } from '@backstage/plugin-search-react/alpha';


import {
    DefaultResultListItem,
    SearchBar,
    SearchPagination,
    SearchResult as SearchResults,
    SearchResultPager,
    SearchContextProvider,
} from '@backstage/plugin-search-react';
import { SearchResult } from '@backstage/plugin-search-common';
import { Container } from '@backstage/ui';

const searchPageOverride = PageBlueprint.makeWithOverrides({
    inputs: {
        items: createExtensionInput([SearchResultListItemBlueprint.dataRefs.item]),
    },
    factory(originalFactory, { inputs }) {
        return originalFactory({
            path: '/search',
            title: 'Search',
            routeRef: searchPlugin.routes.root,
            loader: async () => {
                const getResultItemComponent = (result: SearchResult) => {
                    const value = inputs.items.find(item =>
                        item
                            ?.get(SearchResultListItemBlueprint.dataRefs.item)
                            .predicate?.(result),
                    );
                    return (
                        value?.get(SearchResultListItemBlueprint.dataRefs.item).component ??
                        DefaultResultListItem
                    );
                };
                const Component = () => {
                    return (
                        <Container>
                            <SearchBar debounceTime={100} />
                            <SearchPagination />
                            <SearchResults>
                                {({ results }) => (
                                    <>
                                        {results.map((result, index) => {
                                            const { document, ...rest } = result;
                                            const SearchResultListItem =
                                                getResultItemComponent(result);
                                            return (
                                                <SearchResultListItem
                                                    {...rest}
                                                    key={index}
                                                    result={document}
                                                    noTrack
                                                />
                                            );
                                        })}
                                    </>
                                )}
                            </SearchResults>
                            <SearchResultPager />
                        </Container>
                    );
                };
                return (
                    <SearchContextProvider>
                        <Component />
                    </SearchContextProvider>
                );
            },
        });
    },
});

export const searchCustomizations = createFrontendModule({
    pluginId: 'search',
    extensions: [
        searchPageOverride,
        McaSearchResultListItemExtension,
        ApiSearchResultListItemExtension
    ],
});