import { AppTheme } from '@backstage/core-plugin-api';
import LightIcon from '@material-ui/icons/WbSunny';
import DarkIcon from '@material-ui/icons/WbSunnyOutlined';
import React from 'react';
 
import { PageTheme, UnifiedTheme, UnifiedThemeOptions, UnifiedThemeProvider, createUnifiedTheme, genPageTheme, palettes, shapes } from '@backstage/theme';
 
function createCustomBaseTheme(palette: UnifiedThemeOptions['palette'], pageTheme: PageTheme): UnifiedTheme {
    return createUnifiedTheme({
        palette: {
            ...palette,
            primary: {
                main: '#C30045',
            },
            secondary: {
                main: '#51626F',
            },
            error: {
                main: '#f44336',
            },
            warning: {
                main: '#ff9800',
            },
            info: {
                main: '#2196f3',
            },
            success: {
                main: '#4caf50',
            },
            banner: {
                info: '#C30045',
                error: '#f44336',
                text: '#ffffff',
                link: '#ffffff',
            },
            errorBackground: '#8c4351',
            warningBackground: '#8f5e15',
            infoBackground: '#343b58',
            navigation: {
                background: '#51626F',
                indicator: '#C30045',
                color: '#d5d6db',
                selectedColor: '#ffffff',
            },
        },
        defaultPageTheme: 'home',
        pageTheme: {
            home: pageTheme,
            documentation: pageTheme,
            tool: pageTheme,
            service: pageTheme,
            website: pageTheme,
            library: pageTheme,
            other: pageTheme,
            app: pageTheme,
            apis: pageTheme,
        },
    });
}
 
const lightPageTheme = genPageTheme({ colors: ['#C30045', '#F3CCDA'], shape: shapes.round });
const darkPageTheme = genPageTheme({ colors: ['#C30045', '#880030'], shape: shapes.round });
 
export const carthThemes: AppTheme[] = [
    {
        id: 'light-theme',
        title: 'Light Theme',
        variant: 'light',
        icon: <LightIcon />,
        Provider: ({ children }) => <UnifiedThemeProvider theme={createCustomBaseTheme(palettes.light, lightPageTheme)} children={children} />,
    },
    {
        id: 'dark-theme',
        title: 'Dark Theme',
        variant: 'dark',
        icon: <DarkIcon />,
        Provider: ({ children }) => <UnifiedThemeProvider theme={createCustomBaseTheme(palettes.dark, darkPageTheme)} children={children} />,
    },
];