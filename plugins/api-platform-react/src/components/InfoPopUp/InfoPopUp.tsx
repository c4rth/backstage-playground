import { ReactNode } from 'react';
import { RiInformationLine } from '@remixicon/react';
import { InfoPopOver } from '@internal/plugin-api-platform-react';
import { Box, Flex, Text, TextVariants } from '@backstage/ui';

export interface InfoPopUpProps {
    text: string;
    title?: string;
    variant?: TextVariants;
    content: ReactNode;
}

export const InfoPopUp = (props: InfoPopUpProps) => {

    const { text, title, variant = 'body-medium', content } = props;

    return (
        <Flex align='center' mt='2' gap='xs'>
            <Box as="span">
                <Text variant={variant} style={{ color: "var(--bui-fg-solid)" }}>{text}</Text>
            </Box>
            <InfoPopOver title={title} content={content}>
                <RiInformationLine style={{ color: "var(--bui-fg-solid)" }} aria-label="More information" />
            </InfoPopOver>
        </Flex>
    );
}

export interface InfoPopUpContentProps {
    text1: string;
    text2?: string;
}

export const InfoPopUpContent = (props: InfoPopUpContentProps) => {
    const { text1, text2 } = props;
    return (
        <Box>
            <Text variant="body-large">{text1}</Text>
            {text2 && (
                <>
                    <br />
                    <Box mt='1'>
                        <Text variant="body-medium"><i>{text2}</i></Text>
                    </Box>
                </>
            )}
        </Box>
    );
};