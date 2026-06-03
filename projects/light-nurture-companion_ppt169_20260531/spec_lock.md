# Execution Lock

> Machine-readable execution contract. Executor MUST `read_file` this before every SVG page.
> For design narrative, see `design_spec.md`.

## canvas
- viewBox: 0 0 1280 720
- format: PPT 16:9

## colors
- bg: #FDFCF9
- bg_secondary: #F4F7F5
- bg_dark: #1C3A2C
- primary: #498268
- accent: #F5973B
- secondary_accent: #D85C7E
- text: #1C3A2C
- text_secondary: #6D9C83
- text_tertiary: #9BBBA8
- text_on_dark: #FDFCF9
- border: #E5D9C3
- warning_bg: #FEF3E4
- warning_text: #9C5018
- emotion_bg: #FDF6F8
- emotion_text: #72263A
- card_accent_1: #D85C7E
- card_accent_2: #F5973B
- card_accent_3: #498268
- card_accent_4: #6D9C83
- card_accent_5: #C4D6CC
- warm_light: #FEFAF5
- ink_light: #E2EBE5
- dark_mid: #244737
- paper_warm: #F8F4ED
- emotion_light: #FBEEF2

## typography
- font_family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif
- code_family: Consolas, "Courier New", monospace
- body: 18
- title: 30
- subtitle: 22
- annotation: 14
- cover_title: 56
- page_number: 11

## icons
- library: tabler-filled
- inventory: home, droplet, man, mood-smile, book, chart-area, heart, shield, lock, database, palette, star, check, leaf, sun, moon, message, quote, paw, eye, camera, phone, clock, pill, bed, sparkles, download, calendar, presentation, bulb, flower, sunset, bell, user

## images
- screenshot_home: images/screenshot_home.png (Placeholder)
- screenshot_water: images/screenshot_water.png (Placeholder)
- screenshot_breathing: images/screenshot_breathing.png (Placeholder)
- screenshot_treehole: images/screenshot_treehole.png (Placeholder)

## page_rhythm
- P01: anchor
- P02: anchor
- P03: dense
- P04: breathing
- P05: dense
- P06: dense
- P07: dense
- P08: dense
- P09: dense
- P10: dense
- P11: dense
- P12: dense
- P13: dense
- P14: breathing
- P15: dense
- P16: breathing
- P17: anchor

## forbidden
- Mixing icon libraries
- rgba()
- `<style>`, `class`, `<foreignObject>`, `textPath`, `@font-face`, `<animate*>`, `<script>`, `<iframe>`, `<symbol>`+`<use>`
- `<g opacity>` (set opacity on each child element individually)
