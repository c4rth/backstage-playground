import {
    ConfigContent,
    ExternalDependenciesContent,
    InfoContent,
    ScheduledTasksContent,
} from '@backstage/plugin-devtools';
import { DevToolsLayout } from '@backstage/plugin-devtools';
import { UnprocessedEntitiesContent } from '@backstage/plugin-catalog-unprocessed-entities';

export const DevToolsPage = () => {
    return (
        <DevToolsLayout>
            <DevToolsLayout.Route path="info" title="Info">
                <InfoContent />
            </DevToolsLayout.Route>
            <DevToolsLayout.Route path="config" title="Config">
                <ConfigContent />
            </DevToolsLayout.Route>
            <DevToolsLayout.Route
                path="external-dependencies"
                title="External Dependencies"           >
                <ExternalDependenciesContent />
            </DevToolsLayout.Route>
            <DevToolsLayout.Route path="unprocessed-entities" title="Unprocessed Entities">
                <UnprocessedEntitiesContent />
            </DevToolsLayout.Route>
            <DevToolsLayout.Route path="scheduled-tasks" title="Scheduled Tasks">
                <ScheduledTasksContent />
            </DevToolsLayout.Route>
            <DevToolsLayout.Route path="analytics" title="Analytics">
                <>
                    <p>This page shows analytics data related to the usage of Backstage. It is only visible if the analytics plugin is enabled.</p>
                    <p>Currently, there is no analytics data to display. This page will be populated with data in future releases.</p>
                </>
            </DevToolsLayout.Route>
        </DevToolsLayout>
    );
};

export const customDevToolsPage = <DevToolsPage />;