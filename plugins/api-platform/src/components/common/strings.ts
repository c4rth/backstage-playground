export function getStringForKey(key: string): string {
    switch (key) {
        case 'ServicePlatformExplorerPage.text1':
            return 'Browse all service definitions registered in Backstage. This screen provides a searchable and filterable table of services, including their names, descriptions, and associated metadata. Use this view to quickly find, review, and navigate to detailed information about each service in your platform.';
        case 'ServicePlatformExplorerPage.text2':
            return 'The Service Explorer helps you maintain visibility and control over your organization\'s services, making it easy to discover, document, and govern your service landscape.';

        case 'ApiExplorerPage.text1':
            return "Explore all API definitions registered in Backstage. This screen provides a searchable and filterable table of APIs, including their names, descriptions, and associated systems. Use this view to quickly find, review, and navigate to detailed information about each API in your platform.";
        case 'ApiExplorerPage.text2':
            return "The API Explorer helps you maintain visibility and control over your organization's APIs, making it easy to discover, document, and govern your API landscape.";

        case 'SystemPlatformExplorerPage.text1':
            return "View all system definitions registered in Backstage. This screen provides a searchable and filterable table of systems, including their names, descriptions, and related metadata. Use this view to quickly find, review, and navigate to detailed information about each system in your platform.";
        case 'SystemPlatformExplorerPage.text2':
            return "The System Explorer helps you maintain visibility and control over your organization's systems, making it easy to discover, document, and govern your technical landscape.";

        default:
            return 'N/A';
    }
}

