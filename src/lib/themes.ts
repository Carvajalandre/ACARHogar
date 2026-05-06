export type ThemeName =
  | "noir-red"
  | "midnight-purple"
  | "dark-slate-blue"
  | "dark-cyan"
  | "black-pink"
  | "midnight-violet"
  | "dark-green"
  | "dark-teal";

export interface ThemeMeta {
  label: string;
  preview: string; // primary color for visual preview
}

export const themeMeta: Record<ThemeName, ThemeMeta> = {
  "noir-red":         { label: "Rojo Noir",       preview: "oklch(0.45 0.22 25)" },
  "midnight-purple":  { label: "Púrpura Noche",   preview: "oklch(0.42 0.27 300)" },
  "dark-slate-blue":  { label: "Azul Pizarra",    preview: "oklch(0.58 0.14 260)" },
  "dark-cyan":        { label: "Cian Oscuro",      preview: "oklch(0.55 0.12 200)" },
  "black-pink":       { label: "Rosa Negro",       preview: "oklch(0.52 0.22 340)" },
  "midnight-violet":  { label: "Violeta Noche",    preview: "oklch(0.45 0.28 285)" },
  "dark-green":       { label: "Verde Oscuro",     preview: "oklch(0.65 0.20 130)" },
  "dark-teal":        { label: "Teal Oscuro",      preview: "oklch(0.55 0.14 175)" },
};

// All values are in OKLCH format to match globals.css
export const themes: Record<ThemeName, Record<string, string>> = {
  "noir-red": {
    background:           "oklch(0.0 0 0)",
    foreground:           "oklch(1.0 0 0)",
    card:                 "oklch(0.15 0 0)",
    "card-foreground":    "oklch(1.0 0 0)",
    primary:              "oklch(0.45 0.22 25)",
    "primary-foreground": "oklch(1.0 0 0)",
    secondary:            "oklch(0.25 0.10 25)",
    "secondary-foreground":"oklch(1.0 0 0)",
    muted:                "oklch(0.20 0 0)",
    "muted-foreground":   "oklch(0.65 0 0)",
    accent:               "oklch(0.25 0.10 25)",
    "accent-foreground":  "oklch(1.0 0 0)",
    destructive:          "oklch(0.577 0.245 27.325)",
    border:               "oklch(0.25 0 0)",
    input:                "oklch(0.25 0 0)",
    ring:                 "oklch(0.45 0.22 25)",
    popover:              "oklch(0.15 0 0)",
    "popover-foreground": "oklch(1.0 0 0)",
  },
  "midnight-purple": {
    background:           "oklch(0.0 0 0)",
    foreground:           "oklch(1.0 0 0)",
    card:                 "oklch(0.15 0.04 300)",
    "card-foreground":    "oklch(1.0 0 0)",
    primary:              "oklch(0.42 0.27 300)",
    "primary-foreground": "oklch(1.0 0 0)",
    secondary:            "oklch(0.28 0.15 300)",
    "secondary-foreground":"oklch(1.0 0 0)",
    muted:                "oklch(0.20 0.04 290)",
    "muted-foreground":   "oklch(0.65 0 0)",
    accent:               "oklch(0.38 0.22 300)",
    "accent-foreground":  "oklch(1.0 0 0)",
    destructive:          "oklch(0.577 0.245 27.325)",
    border:               "oklch(0.25 0 0)",
    input:                "oklch(0.25 0.03 300)",
    ring:                 "oklch(0.42 0.27 300)",
    popover:              "oklch(0.15 0.04 300)",
    "popover-foreground": "oklch(1.0 0 0)",
  },
  "dark-slate-blue": {
    background:           "oklch(0.22 0.01 250)",
    foreground:           "oklch(1.0 0 0)",
    card:                 "oklch(0.26 0.02 250)",
    "card-foreground":    "oklch(1.0 0 0)",
    primary:              "oklch(0.58 0.14 260)",
    "primary-foreground": "oklch(1.0 0 0)",
    secondary:            "oklch(0.72 0.10 260)",
    "secondary-foreground":"oklch(0.22 0.01 250)",
    muted:                "oklch(0.30 0.02 250)",
    "muted-foreground":   "oklch(0.65 0 0)",
    accent:               "oklch(0.58 0.14 260)",
    "accent-foreground":  "oklch(1.0 0 0)",
    destructive:          "oklch(0.577 0.245 27.325)",
    border:               "oklch(0.35 0.02 250)",
    input:                "oklch(0.30 0.02 250)",
    ring:                 "oklch(0.58 0.14 260)",
    popover:              "oklch(0.26 0.02 250)",
    "popover-foreground": "oklch(1.0 0 0)",
  },
  "dark-cyan": {
    background:           "oklch(0.22 0.02 240)",
    foreground:           "oklch(1.0 0 0)",
    card:                 "oklch(0.30 0.02 240)",
    "card-foreground":    "oklch(1.0 0 0)",
    primary:              "oklch(0.55 0.12 200)",
    "primary-foreground": "oklch(0.0 0 0)",
    secondary:            "oklch(0.65 0.15 195)",
    "secondary-foreground":"oklch(0.0 0 0)",
    muted:                "oklch(0.38 0.02 240)",
    "muted-foreground":   "oklch(0.80 0 0)",
    accent:               "oklch(0.55 0.12 200)",
    "accent-foreground":  "oklch(0.0 0 0)",
    destructive:          "oklch(0.577 0.245 27.325)",
    border:               "oklch(0.35 0.02 240)",
    input:                "oklch(0.35 0.02 240)",
    ring:                 "oklch(0.55 0.12 200)",
    popover:              "oklch(0.30 0.02 240)",
    "popover-foreground": "oklch(1.0 0 0)",
  },
  "black-pink": {
    background:           "oklch(0.0 0 0)",
    foreground:           "oklch(1.0 0 0)",
    card:                 "oklch(0.14 0.05 340)",
    "card-foreground":    "oklch(1.0 0 0)",
    primary:              "oklch(0.52 0.22 340)",
    "primary-foreground": "oklch(1.0 0 0)",
    secondary:            "oklch(0.32 0.14 340)",
    "secondary-foreground":"oklch(1.0 0 0)",
    muted:                "oklch(0.22 0.05 340)",
    "muted-foreground":   "oklch(0.80 0 0)",
    accent:               "oklch(0.75 0.14 350)",
    "accent-foreground":  "oklch(0.0 0 0)",
    destructive:          "oklch(0.577 0.245 27.325)",
    border:               "oklch(0.28 0.06 340)",
    input:                "oklch(0.25 0.05 340)",
    ring:                 "oklch(0.52 0.22 340)",
    popover:              "oklch(0.14 0.05 340)",
    "popover-foreground": "oklch(1.0 0 0)",
  },
  "midnight-violet": {
    background:           "oklch(0.18 0.02 270)",
    foreground:           "oklch(1.0 0 0)",
    card:                 "oklch(0.28 0.04 275)",
    "card-foreground":    "oklch(1.0 0 0)",
    primary:              "oklch(0.45 0.28 285)",
    "primary-foreground": "oklch(1.0 0 0)",
    secondary:            "oklch(0.50 0.22 285)",
    "secondary-foreground":"oklch(1.0 0 0)",
    muted:                "oklch(0.24 0.03 270)",
    "muted-foreground":   "oklch(0.65 0 0)",
    accent:               "oklch(0.45 0.28 285)",
    "accent-foreground":  "oklch(1.0 0 0)",
    destructive:          "oklch(0.577 0.245 27.325)",
    border:               "oklch(0.35 0.04 275)",
    input:                "oklch(0.30 0.04 275)",
    ring:                 "oklch(0.45 0.28 285)",
    popover:              "oklch(0.28 0.04 275)",
    "popover-foreground": "oklch(1.0 0 0)",
  },
  "dark-green": {
    background:           "oklch(0.18 0.02 260)",
    foreground:           "oklch(1.0 0 0)",
    card:                 "oklch(0.22 0.03 145)",
    "card-foreground":    "oklch(1.0 0 0)",
    primary:              "oklch(0.65 0.20 130)",
    "primary-foreground": "oklch(0.0 0 0)",
    secondary:            "oklch(0.42 0.14 130)",
    "secondary-foreground":"oklch(1.0 0 0)",
    muted:                "oklch(0.24 0.02 145)",
    "muted-foreground":   "oklch(0.80 0 0)",
    accent:               "oklch(0.30 0.10 130)",
    "accent-foreground":  "oklch(1.0 0 0)",
    destructive:          "oklch(0.577 0.245 27.325)",
    border:               "oklch(0.30 0.03 145)",
    input:                "oklch(0.28 0.03 145)",
    ring:                 "oklch(0.65 0.20 130)",
    popover:              "oklch(0.22 0.03 145)",
    "popover-foreground": "oklch(1.0 0 0)",
  },
  "dark-teal": {
    background:           "oklch(0.18 0.02 200)",
    foreground:           "oklch(1.0 0 0)",
    card:                 "oklch(0.28 0.03 195)",
    "card-foreground":    "oklch(1.0 0 0)",
    primary:              "oklch(0.55 0.14 175)",
    "primary-foreground": "oklch(0.0 0 0)",
    secondary:            "oklch(0.92 0.01 130)",
    "secondary-foreground":"oklch(0.0 0 0)",
    muted:                "oklch(0.24 0.02 200)",
    "muted-foreground":   "oklch(0.80 0 0)",
    accent:               "oklch(0.55 0.14 175)",
    "accent-foreground":  "oklch(0.0 0 0)",
    destructive:          "oklch(0.577 0.245 27.325)",
    border:               "oklch(0.35 0.03 195)",
    input:                "oklch(0.30 0.03 195)",
    ring:                 "oklch(0.55 0.14 175)",
    popover:              "oklch(0.28 0.03 195)",
    "popover-foreground": "oklch(1.0 0 0)",
  },
};

export function applyTheme(themeName: ThemeName) {
  const root = document.documentElement;
  const vars = themes[themeName];
  if (!vars) return;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  localStorage.setItem("theme", themeName);
}