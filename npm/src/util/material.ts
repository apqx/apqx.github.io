import { argbFromHex, MaterialDynamicColors, type DynamicColor, Hct, SchemeTonalSpot, hexFromArgb } from "@material/material-color-utilities"

export interface MaterialYouThemeColorTokens {
    // Primary
    'primary': DynamicColor
    'on-primary': DynamicColor
    'primary-container': DynamicColor
    'on-primary-container': DynamicColor
    // Secondary
    'secondary': DynamicColor
    'on-secondary': DynamicColor
    'secondary-container': DynamicColor
    'on-secondary-container': DynamicColor
    // Tertiary
    'tertiary': DynamicColor
    'on-tertiary': DynamicColor
    'tertiary-container': DynamicColor
    'on-tertiary-container': DynamicColor
    // Error
    'error': DynamicColor
    'on-error': DynamicColor
    'error-container': DynamicColor
    'on-error-container': DynamicColor
    // Neutral
    'background': DynamicColor
    'on-background': DynamicColor
    'surface': DynamicColor
    'on-surface': DynamicColor
    'surface-variant': DynamicColor
    'on-surface-variant': DynamicColor
    'surface-dim': DynamicColor
    'surface-bright': DynamicColor
    'surface-container-lowest': DynamicColor
    'surface-container-low': DynamicColor
    'surface-container': DynamicColor
    'surface-container-high': DynamicColor
    'surface-container-highest': DynamicColor
    'outline': DynamicColor
    'outline-variant': DynamicColor

    'inverse-surface': DynamicColor
    'inverse-on-surface': DynamicColor
    'inverse-primary': DynamicColor

    'scrim': DynamicColor
    'shadow': DynamicColor
}

export interface MaterialYouTheme {
    sourceColorHct: Hct
    colorTokens: MaterialYouThemeColorTokens
    light: Map<string, string>
    dark: Map<string, string>
}


/**
 * 从源色生成 Material You 主题，包含亮色和暗色两套颜色 Token
 * @param sourceColorHex 源色，十六进制字符串，例如 "#5a5fc1"
 */
export function materialYouThemeFromSourceColor(sourceColorHex: string): MaterialYouTheme {
    const sourceColorHct = Hct.fromInt(argbFromHex(sourceColorHex));
    const dynamicColors = new MaterialDynamicColors();
    // 显式映射现代 M3 规范所需的色彩 Token
    const colorTokens = {
        'primary': dynamicColors.primary(),
        'on-primary': dynamicColors.onPrimary(),
        'primary-container': dynamicColors.primaryContainer(),
        'on-primary-container': dynamicColors.onPrimaryContainer(),

        'secondary': dynamicColors.secondary(),
        'on-secondary': dynamicColors.onSecondary(),
        'secondary-container': dynamicColors.secondaryContainer(),
        'on-secondary-container': dynamicColors.onSecondaryContainer(),

        'tertiary': dynamicColors.tertiary(),
        'on-tertiary': dynamicColors.onTertiary(),
        'tertiary-container': dynamicColors.tertiaryContainer(),
        'on-tertiary-container': dynamicColors.onTertiaryContainer(),

        'error': dynamicColors.error(),
        'on-error': dynamicColors.onError(),
        'error-container': dynamicColors.errorContainer(),
        'on-error-container': dynamicColors.onErrorContainer(),

        'background': dynamicColors.background(),
        'on-background': dynamicColors.onBackground(),

        'surface': dynamicColors.surface(),
        'on-surface': dynamicColors.onSurface(),
        'surface-variant': dynamicColors.surfaceVariant(),
        'on-surface-variant': dynamicColors.onSurfaceVariant(),
        'surface-dim': dynamicColors.surfaceDim(),
        'surface-bright': dynamicColors.surfaceBright(),
        'surface-container-lowest': dynamicColors.surfaceContainerLowest(),
        'surface-container-low': dynamicColors.surfaceContainerLow(),
        'surface-container': dynamicColors.surfaceContainer(),
        'surface-container-high': dynamicColors.surfaceContainerHigh(),
        'surface-container-highest': dynamicColors.surfaceContainerHighest(),

        'outline': dynamicColors.outline(),
        'outline-variant': dynamicColors.outlineVariant(),

        'inverse-surface': dynamicColors.inverseSurface(),
        'inverse-on-surface': dynamicColors.inverseOnSurface(),
        'inverse-primary': dynamicColors.inversePrimary(),

        'scrim': dynamicColors.scrim(),
        'shadow': dynamicColors.shadow(),
    };
    return {
        sourceColorHct: sourceColorHct,
        colorTokens: colorTokens,
        light: calcMaterialColors(sourceColorHct, colorTokens, false),
        dark: calcMaterialColors(sourceColorHct, colorTokens, true)
    }
}

function calcMaterialColors(sourceColorHct: Hct, colorTokens: MaterialYouThemeColorTokens, isDark: boolean) {
    // 创建现代动态方案，此处是最常用的 TonalSpot
    const scheme = new SchemeTonalSpot(sourceColorHct, isDark, 0.0);
    const result: Map<string, string> = new Map()

    // 遍历并动态注入 CSS 变量
    for (const [tokenName, dynamicColor] of Object.entries(colorTokens)) {
        const argb = dynamicColor.getArgb(scheme);
        const hex = hexFromArgb(argb);
        result.set(`--md-sys-color-${tokenName}`, hex);
    }
    return result
}

export function applyModernM3Theme(theme: MaterialYouTheme, dark: boolean, targetElement: HTMLElement = document.body) {
    const colorTokens = dark ? theme.dark : theme.light
    for (const [tokenName, tokenValue] of colorTokens.entries()) {
        targetElement.style.setProperty(tokenName, tokenValue)
    }
}