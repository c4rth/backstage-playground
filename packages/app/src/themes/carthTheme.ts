import { createBaseThemeOptions, createUnifiedTheme, genPageTheme, palettes, shapes } from "@backstage/theme";

export const carthLightTheme = createUnifiedTheme({
    ...createBaseThemeOptions({
        palette: {
            ...palettes.light,
            primary: {
                main: '#343b58',
            },
            secondary: {
                main: '#565a6e',
            },
            error: {
                main: '#8c4351',
            },
            warning: {
                main: '#8f5e15',
            },
            info: {
                main: '#34548a',
            },
            success: {
                main: '#485e30',
            },
            background: {
                default: '#ffffff',
                //paper: '#f5f6fb',
            },
            banner: {
                info: '#34548a',
                error: '#8c4351',
                text: '#343b58',
                link: '#565a6e',
            },
            errorBackground: '#8c4351',
            warningBackground: '#8f5e15',
            infoBackground: '#343b58',
            navigation: {
                background: '#343b58',
                indicator: '#8f5e15',
                color: '#d5d6db',
                selectedColor: '#ffffff',
            },
        },
    }),
    fontFamily: 'Arial',
    defaultPageTheme: 'home',
    pageTheme: {
        home: genPageTheme({ colors: ['#8c4351', '#343b58'], shape: 'none' }),
        documentation: genPageTheme({
            colors: ['#8c4351', '#343b58'],
            shape: shapes.wave2,
        }),
        tool: genPageTheme({ colors: ['#8c4351', '#343b58'], shape: shapes.round }),
        service: genPageTheme({
            colors: ['#8c4351', '#343b58'],
            shape: shapes.wave,
        }),
        website: genPageTheme({
            colors: ['#8c4351', '#343b58'],
            shape: shapes.wave,
        }),
        library: genPageTheme({
            colors: ['#8c4351', '#343b58'],
            shape: shapes.wave,
        }),
        other: genPageTheme({ colors: ['#8c4351', '#343b58'], shape: shapes.wave }),
        app: genPageTheme({ colors: ['#8c4351', '#343b58'], shape: shapes.wave }),
        apis: genPageTheme({ colors: ['#8c4351', '#343b58'], shape: shapes.wave }),
    },
});

export const carthDarkTheme = createUnifiedTheme({
    ...createBaseThemeOptions({
        palette: {
            ...palettes.dark,
            primary: {
                main: '#343b58',
            },
            secondary: {
                main: '#565a6e',
            },
            error: {
                main: '#8c4351',
            },
            warning: {
                main: '#8f5e15',
            },
            info: {
                main: '#34548a',
            },
            success: {
                main: '#485e30',
            },
            banner: {
                info: '#34548a',
                error: '#8c4351',
                text: '#343b58',
                link: '#565a6e',
            },
            errorBackground: '#8c4351',
            warningBackground: '#8f5e15',
            infoBackground: '#343b58',
            navigation: {
                background: '#343b58',
                indicator: '#8f5e15',
                color: '#d5d6db',
                selectedColor: '#ffffff',
            },
        },
    }),
    fontFamily: 'Arial',
    defaultPageTheme: 'home',
    pageTheme: {
        home: genPageTheme({ colors: ['#8c4351', '#343b58'], shape: 'none' }),
        documentation: genPageTheme({
            colors: ['#8c4351', '#343b58'],
            shape: shapes.wave2,
        }),
        tool: genPageTheme({ colors: ['#8c4351', '#343b58'], shape: shapes.round }),
        service: genPageTheme({
            colors: ['#8c4351', '#343b58'],
            shape: shapes.wave,
        }),
        website: genPageTheme({
            colors: ['#8c4351', '#343b58'],
            shape: shapes.wave,
        }),
        library: genPageTheme({
            colors: ['#8c4351', '#343b58'],
            shape: shapes.wave,
        }),
        other: genPageTheme({ colors: ['#8c4351', '#343b58'], shape: shapes.wave }),
        app: genPageTheme({ colors: ['#8c4351', '#343b58'], shape: shapes.wave }),
        apis: genPageTheme({ colors: ['#8c4351', '#343b58'], shape: shapes.wave }),
    },
});