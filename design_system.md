# Sistema de diseño

Estilo visual de la app: fondo blanco, tarjetas grandes y redondeadas, botones en píldora, guinda como color de marca y olivo como color secundario. La fuente es **Nunito**. Los colores salen del emblema de la Corte Superior de Justicia del Santa.

Los tokens viven en `lib/core/theme/` y `AppTheme` los aplica a los widgets de Material. Las pantallas deben usar `Theme.of(context)` y estos tokens, sin colores ni radios sueltos.

## Color

| Token | Hex | Uso |
| --- | --- | --- |
| `AppColors.guinda` | `#800000` | Marca, botones principales, tarjetas destacadas, progreso |
| `AppColors.olivo` | `#6E6A59` | Botón secundario, texto de apoyo, iconos complementarios |
| `AppColors.carbon` | `#4A4A4A` | Títulos y texto de lectura |
| `AppColors.blanco` | `#FFFFFF` | Fondo de pantalla, tarjetas y campos |
| `AppColors.ink` | `#4A4A4A` | Alias de `carbon` para el texto |
| `AppColors.muted` | `#6E6A59` | Alias de `olivo` para horas y ayudas |
| `AppColors.suave` | `#F3F2EE` | Bloques suaves, pista del progreso, chips |
| `AppColors.line` | `#E4E2DB` | Bordes y divisores |
| `AppColors.danger` | `#800000` | Errores, el mismo guinda de marca |

En modo oscuro el fondo pasa a `#242424`, las superficies a `#2E2E2E` y el texto a blanco. El guinda y el olivo se mantienen.

En el `ColorScheme`:

- `primary` es el guinda. Va en iconos, bordes activos y la acción principal.
- `secondary` es el olivo. Va en la acción secundaria.
- `secondaryContainer` es el suave. Va en bloques de apoyo.

Una sola palabra del título puede ir en guinda con `AppTypography.accent(style)`, como en “Control de **asistencia**”.

## Formas

| Token | Radio | Forma | Uso |
| --- | --- | --- | --- |
| `AppShapes.pill` | 999 | Píldora | Botones, chips, barra de progreso, día seleccionado |
| `AppShapes.card` | 28 | Rectángulo muy redondeado | Tarjeta hito, calendario, diálogos, carga de archivo |
| `AppShapes.tile` | 22 | Rectángulo redondeado | Sesiones, mensajes, snackbars |
| `AppShapes.field` | 18 | Campo redondeado | Inputs y selects |
| Círculo | 50% | Disco | Anillo de avance y botón flotante |

Alturas:

- Botón: `52`
- Anillo de progreso: `76`
- Barra inferior: `68`
- Padding de página: `20`

Las tarjetas no llevan sombra fuerte ni borde oscuro. El relieve sale del contraste entre blanco, suave, olivo y guinda. El botón guinda no tiene elevación.

## Letras

Familia: **Nunito**, la misma de la maqueta. Títulos en ExtraBold (800), títulos de tarjeta en Bold (700), texto y horas en SemiBold (600) y botones en ExtraBold (800). Los cortes están en `assets/fonts/`. Licencia SIL Open Font License, en `assets/fonts/OFL.txt`.

| Estilo | Tamaño | Peso | Interlineado | Tracking | Uso |
| --- | --- | --- | --- | --- | --- |
| `headlineLarge` | 34 | 800 | 1.12 | -0.6 | Título de acceso |
| `headlineMedium` | 28 | 800 | 1.15 | -0.4 | Saludo del inicio |
| `headlineSmall` | 24 | 800 | 1.20 | -0.3 | Título corto |
| `titleLarge` | 22 | 800 | 1.20 | -0.2 | Sección y barra superior |
| `titleMedium` | 16 | 700 | 1.25 | 0 | Título de tarjeta |
| `titleSmall` | 14 | 700 | 1.25 | 0 | Título compacto |
| `bodyLarge` | 16 | 600 | 1.45 | 0 | Texto dentro de tarjetas |
| `bodyMedium` | 13 | 600 | 1.40 | 0 | Ayudas, horas, etiquetas de campo |
| `bodySmall` | 12 | 600 | 1.35 | 0 | Nota menor |
| `labelLarge` | 16 | 800 | 1.10 | 0 | Texto de botón |
| `labelMedium` | 12 | 700 | 1.10 | 0 | Chip y barra de navegación |
| `labelSmall` | 11 | 700 | 1.10 | 0 | Meta muy corta |

Los títulos van en peso extra bold y un poco apretados. El texto de apoyo usa olivo. No se usa itálica ni mayúsculas sostenidas.

## Componentes

`AppTheme.light` y `AppTheme.dark` ya definen:

- Fondo blanco y barra superior plana, con el título en `titleLarge`.
- Tarjetas blancas con radio `card`.
- Campos rellenos, radio `field` y borde guinda al enfocar.
- Botón relleno y elevado en píldora guinda, con texto blanco.
- Botón con contorno en píldora guinda.
- Botón de texto guinda.
- Botón flotante circular guinda.
- Barra de navegación blanca, indicador suave.
- Chips en píldora suave.
- Progreso guinda sobre pista suave.
- Diálogo y hoja inferior con radio `card`.
- Snackbar flotante guinda con radio `tile`.

Widgets propios:

- `CustomButton` primario: píldora guinda. Secundario: píldora olivo con texto blanco.
- `HitoCard`: bloque guinda con texto blanco.
- `ProgressBar`: barra en píldora más anillo circular con el porcentaje.
- `UploadBox`: bloque suave con radio `card`.

## Cómo usarlo

```dart
Theme(
  data: AppTheme.light,
  child: const HomeScreen(),
)
```

La app ya elige `AppTheme.light` o `AppTheme.dark` desde `ThemeProvider`.

```dart
Text('Sesiones recientes', style: Theme.of(context).textTheme.titleLarge);

Text.rich(
  TextSpan(
    text: 'Tu ',
    children: [
      TextSpan(
        text: 'avance',
        style: AppTypography.accent(Theme.of(context).textTheme.headlineMedium),
      ),
    ],
  ),
  style: Theme.of(context).textTheme.headlineMedium,
);
```

Para una tarjeta nueva, usa `Card` o `AppShapes.card` con `AppColors.blanco`, `AppColors.suave` o `AppColors.guinda`. La acción principal va en guinda; el olivo se reserva para la acción secundaria y el texto de apoyo.
