import sys
from PyQt6.QtWidgets import QApplication

from qubit_desktop.gui import QubitMainWindow


def main() -> None:
    app = QApplication(sys.argv)
    win = QubitMainWindow()
    win.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()


