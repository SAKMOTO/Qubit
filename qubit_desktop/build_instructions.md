Developer setup

1. uv venv --python 3.11
2. source .venv/bin/activate  (Windows: .\.venv\Scripts\Activate.ps1)
3. uv pip install -r requirements.txt --prerelease=allow
4. python -m playwright install chromium
5. export BROWSER_USE_API_KEY=YOUR_KEY (Windows: setx BROWSER_USE_API_KEY YOUR_KEY)
6. python main.py

Build installers

- macOS app:
  - pip install pyinstaller
  - pyinstaller --noconsole --name "Qubit" --icon resources/icons/qubit.icns main.py
  - Create DMG (optional): use create-dmg or a custom script

- Windows exe:
  - pip install pyinstaller
  - pyinstaller --noconsole --name "Qubit" --icon resources/icons/qubit.ico main.py
  - Optional NSIS/Inno Setup for installer

Notes

- Cloud mode recommended for reliability and CAPTCHA handling. Set BROWSER_USE_API_KEY.
- Use headed mode for manual intervention when required.

