import {
    ConfigContent,
    ExternalDependenciesContent,
    InfoContent,
    ScheduledTasksContent,
} from '@backstage/plugin-devtools';
import { DevToolsLayout } from '@backstage/plugin-devtools';
import { UnprocessedEntitiesContent } from '@backstage/plugin-catalog-unprocessed-entities';
import { AnalyticsContent } from '@internal/plugin-analytics';

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
                <AnalyticsContent />
            </DevToolsLayout.Route>
        </DevToolsLayout>
    );
};

export const customDevToolsPage = <DevToolsPage />;