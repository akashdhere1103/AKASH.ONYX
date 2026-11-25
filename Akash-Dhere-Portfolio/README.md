# Akash Dhere | CV Portfolio

## Open on Windows

Extract the entire ZIP, then double-click Start-Portfolio.cmd. This requires Python 3 with the Windows Python launcher. Open http://127.0.0.1:8000 in Chrome or Edge. Keep the command window open while viewing and press Ctrl+C to stop.

## Open on macOS or Linux

In Terminal, change into this extracted folder and run:

    python3 -m http.server 8000 --bind 127.0.0.1 --directory dist

Open http://127.0.0.1:8000. Use the local server so JavaScript modules, the 3D model worker and embedded laptop preview can load correctly.

## Project folders

- dist/ — Ready-to-run published website, including the HTML, CSS, JavaScript, animations, audio, images, and both downloadable CVs.
- source-template/ — Editable source template for generating the public site.
- scripts/build-public.py — Python script that builds the public output from the template. Example from the project folder:

      python3 scripts/build-public.py https://akash-dhere-cv-portfolio.briskmoat5.chatgpt.site public-build

  Choose a new output directory each time.
- .openai/hosting.json — Original Sites project configuration.
