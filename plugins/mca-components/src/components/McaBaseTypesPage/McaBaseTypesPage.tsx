import {
    PageWithHeader,
} from '@backstage/core-components';
import { IFramePage } from '@internal/plugin-iframe';

export const McaBaseTypesPage = () => {

    const url = 'https://docs.oracle.com/en/java/javase/24/docs/api/index.html';

    return (
        <PageWithHeader
            themeId="apis"
            title="MCA BaseTypes">
            <IFramePage
                title="BaseTypes"
                iframe={{
                    src: url,
                    height: '100%',
                    width: '100%',
                }}
            />
        </PageWithHeader>
    );
}