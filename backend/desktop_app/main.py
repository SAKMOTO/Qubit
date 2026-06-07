#!/usr/bin/env python3
"""Entry point for the OpenHands Desktop App (PySide6)."""

import sys
import os
from pathlib import Path

# Add the openhands-cli package to sys.path so we can import the engine
repo_root = Path(__file__).resolve().parents[2]
openhands_cli_path = repo_root / "backend" / "OpenHands" / "openhands-cli"
if str(openhands_cli_path) not in sys.path:
    sys.path.insert(0, str(openhands_cli_path))

from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt, QTimer
from desktop_app.ui.main_window import MainWindow


def main():
    """Launch the PySide6 desktop application."""
    QApplication.setApplicationName("OpenHands Desktop")
    QApplication.setOrganizationName("OpenHands")
    QApplication.setApplicationVersion("1.0.0")
    app = QApplication(sys.argv)

    # Enable high DPI scaling
    app.setAttribute(Qt.ApplicationAttribute.AA_EnableHighDpiScaling, True)
    app.setAttribute(Qt.ApplicationAttribute.AA_UseHighDpiPixmaps, True)

    window = MainWindow()
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
