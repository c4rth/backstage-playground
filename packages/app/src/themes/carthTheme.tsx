import { AppTheme } from '@backstage/core-plugin-api';
import { RiSunFill, RiMoonLine } from '@remixicon/react';
import { PageTheme, UnifiedTheme, UnifiedThemeOptions, UnifiedThemeProvider, createUnifiedTheme, genPageTheme, palettes, shapes } from '@backstage/theme';

const colors = {
    rubyRed: '#C30045',
    darkCrimson: '#74002A',
    roseRed: '#E34E79',
    paleRose: '#74002A',
    slateGray: '#51626F',
    charcoalBlue: '#2F3D47',
    white: '#ffffff',
    black: '#000000',
};

function createCustomBaseTheme(palette: UnifiedThemeOptions['palette'], primary: string, secondary: string, pageTheme: PageTheme): UnifiedTheme {
    return createUnifiedTheme({
        palette: {
            ...palette,
            primary: {
                main: primary
            },
            secondary: {
                main: secondary,
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
                info: colors.rubyRed,
                error: '#f44336',
                text: colors.white,
                link: colors.white,
            },
            navigation: {
                background: colors.charcoalBlue,
                indicator: colors.rubyRed,
                color: '#d5d6db',
                selectedColor: colors.white,
                submenu: {
                    background: colors.slateGray,
                }
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
        components: {
            BackstageSidebarItem: {
                styleOverrides: {
                    label: {
                        overflow: 'unset',
                    },
                    root: {
                        overflow: 'hidden',
                        '&.Mui-selected': {
                            backgroundColor: colors.slateGray,
                            color: colors.white,
                            '&:hover': {
                                backgroundColor: colors.slateGray,
                            },
                        },
                    },
                },
            },
        }
    });
}

const lightPageTheme = genPageTheme({ colors: [colors.rubyRed, colors.rubyRed], shape: shapes.round });
const darkPageTheme = genPageTheme({ colors: [colors.darkCrimson, colors.rubyRed], shape: shapes.round });

export const carthThemes: AppTheme[] = [
    {
        id: 'light-theme',
        title: 'Light Theme',
        variant: 'light',
        icon: <RiSunFill />,
        Provider: ({ children }) => <UnifiedThemeProvider theme={createCustomBaseTheme(palettes.light, colors.rubyRed, colors.slateGray, lightPageTheme)} children={children} />,
    },
    {
        id: 'dark-theme',
        title: 'Dark Theme',
        variant: 'dark',
        icon: <RiMoonLine />,
        Provider: ({ children }) => <UnifiedThemeProvider theme={createCustomBaseTheme(palettes.dark, colors.roseRed, colors.slateGray, darkPageTheme)} children={children} />,
    },
];