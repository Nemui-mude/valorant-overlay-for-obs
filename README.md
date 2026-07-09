# VALORANT Overlay

This is a customizable VALORANT overlay for OBS.

## Features

- Customizable UI
- Supported i18n (now supports: ja, en, ko)

## Download

[Here](https://github.com/Nemui-mude/valorant-overlay-for-obs/releases)

## Usage

1. Edit `config.json`

```json
{
  "PORT": 20102,
  "HENRIK_API_KEY": "",
  "LANG": "",
  "AGENT_VISIBLE": true
}
```

- PORT : The number when using start a local server.
- HENRIK_API_KEY : API Key from [HenrikDev VALORANT API](https://api.henrikdev.xyz/dashboard/api-keys) (Login with Discord).
- LANG : Language code (empty = English)
- AGENT_VISIBLE : Show agent history (true = show, false = hide)

2. Launch valorant-overlay.exe

3. Access http://localhost:20102 in OBS browser source.

## How to change background image

- Please place it in the “public” directory with the filename “bg.jpg.”

OR

- Please edit the `--bg-url` directly in `public/css/style.css`
