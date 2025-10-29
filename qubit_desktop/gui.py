from __future__ import annotations

import asyncio
import os
from typing import Optional

from PyQt6.QtCore import Qt, QThread, pyqtSignal, QTimer, QPropertyAnimation, QEasingCurve, QRect
from PyQt6.QtWidgets import (
    QWidget,
    QMainWindow,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QTextEdit,
    QCheckBox,
    QFrame,
    QScrollArea,
    QSplitter,
    QGroupBox,
    QProgressBar,
    QSplashScreen,
)
from PyQt6.QtGui import QFont, QPalette, QColor, QPixmap, QPainter, QPen

from .runner import run_task_stream


class QubitSplashScreen(QSplashScreen):
    def __init__(self):
        # Create a custom pixmap for the splash screen
        pixmap = QPixmap(400, 300)
        pixmap.fill(QColor(30, 30, 30))  # Dark background
        
        painter = QPainter(pixmap)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        # Draw gradient background
        gradient = QPainter.GradientType.LinearGradient
        grad = QPainter.Gradient(0, 0, 400, 300)
        grad.setColorAt(0, QColor(102, 126, 234))  # Purple-blue
        grad.setColorAt(1, QColor(118, 75, 162))   # Purple
        painter.fillRect(0, 0, 400, 300, grad)
        
        # Draw Qubit logo (Q with a circle)
        painter.setPen(QPen(QColor(255, 255, 255), 8))
        painter.setFont(QFont("Arial", 80, QFont.Weight.Bold))
        painter.drawText(50, 100, "Q")
        
        # Draw circle around Q
        painter.setPen(QPen(QColor(255, 255, 255), 6))
        painter.drawEllipse(60, 20, 80, 80)
        
        # Draw "Qubit AI Browser" text
        painter.setFont(QFont("Arial", 24, QFont.Weight.Bold))
        painter.setPen(QPen(QColor(255, 255, 255)))
        painter.drawText(50, 180, "Qubit AI Browser")
        
        # Draw subtitle
        painter.setFont(QFont("Arial", 14))
        painter.setPen(QPen(QColor(255, 255, 255, 180)))
        painter.drawText(50, 210, "Your Intelligent Web Assistant")
        
        # Draw loading dots
        painter.setFont(QFont("Arial", 20))
        painter.setPen(QPen(QColor(255, 255, 255)))
        painter.drawText(50, 250, "Loading...")
        
        painter.end()
        
        super().__init__(pixmap)
        self.setWindowFlags(Qt.WindowType.SplashScreen | Qt.WindowType.FramelessWindowHint)
        
        # Animation for loading dots
        self.dot_count = 0
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_dots)
        self.timer.start(500)  # Update every 500ms
        
    def update_dots(self):
        self.dot_count = (self.dot_count + 1) % 4
        dots = "." * self.dot_count
        self.showMessage(f"Loading{dots}", Qt.AlignmentFlag.AlignBottom | Qt.AlignmentFlag.AlignCenter, QColor(255, 255, 255))


class AgentThread(QThread):
    log_signal = pyqtSignal(str)
    done_signal = pyqtSignal(bool, str)

    def __init__(self, task: str, use_cloud: bool, headed: bool, channel: Optional[str]):
        super().__init__()
        self.task = task
        self.use_cloud = use_cloud
        self.headed = headed
        self.channel = channel

    def run(self) -> None:
        try:
            for evt in run_task_stream(self.task, self.use_cloud, self.headed, self.channel):
                if evt[0] == "log":
                    self.log_signal.emit(evt[1])
                elif evt[0] == "done":
                    self.done_signal.emit(evt[1], evt[2] or "")
        except Exception as e:
            self.log_signal.emit(f"[error] {e}")
            self.done_signal.emit(False, str(e))


class QubitMainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Qubit AI Browser - Your Intelligent Web Assistant")
        self.setMinimumSize(1000, 700)
        self.setStyleSheet(self.get_dark_theme())
        
        # Create splash screen
        self.splash = QubitSplashScreen()
        self.splash.show()
        
        # Center the splash screen
        self.splash.move(
            (self.splash.screen().geometry().width() - self.splash.width()) // 2,
            (self.splash.screen().geometry().height() - self.splash.height()) // 2
        )

        root = QWidget()
        self.setCentralWidget(root)
        layout = QVBoxLayout(root)
        layout.setSpacing(15)
        layout.setContentsMargins(20, 20, 20, 20)

        # Header
        header_frame = QFrame()
        header_frame.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, 
                    stop:0 #667eea, stop:1 #764ba2);
                border-radius: 10px;
                padding: 15px;
            }
        """)
        header_layout = QVBoxLayout(header_frame)
        
        title = QLabel("🚀 Qubit AI Browser")
        title.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 24px;
                font-weight: bold;
                background: transparent;
            }
        """)
        title.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        header_layout.addWidget(title)
        
        subtitle = QLabel("Your Intelligent Web Assistant")
        subtitle.setStyleSheet("""
            QLabel {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                background: transparent;
            }
        """)
        subtitle.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        header_layout.addWidget(subtitle)
        
        layout.addWidget(header_frame)

        # Task Input Section
        task_group = QGroupBox("🎯 Task Input")
        task_group.setStyleSheet("""
            QGroupBox {
                font-weight: bold;
                border: 2px solid #555;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px 0 5px;
            }
        """)
        task_layout = QVBoxLayout(task_group)
        
        input_row = QHBoxLayout()
        self.task_input = QLineEdit()
        self.task_input.setPlaceholderText("Enter your task... e.g. 'Find the latest AI news on Google'")
        self.task_input.setStyleSheet("""
            QLineEdit {
                padding: 12px;
                border: 2px solid #555;
                border-radius: 8px;
                font-size: 14px;
                background: #2a2a2a;
                color: white;
            }
            QLineEdit:focus {
                border-color: #667eea;
            }
        """)
        input_row.addWidget(self.task_input)
        
        self.run_btn = QPushButton("🚀 Run Task")
        self.run_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1, 
                    stop:0 #667eea, stop:1 #764ba2);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1, 
                    stop:0 #5a6fd8, stop:1 #6a4190);
            }
            QPushButton:pressed {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1, 
                    stop:0 #4e5bc6, stop:1 #5e377e);
            }
            QPushButton:disabled {
                background: #555;
                color: #888;
            }
        """)
        input_row.addWidget(self.run_btn)
        task_layout.addLayout(input_row)
        
        # Options row
        options_row = QHBoxLayout()
        self.cloud_cb = QCheckBox("☁️ Use Cloud (Recommended)")
        self.cloud_cb.setChecked(True)
        self.headed_cb = QCheckBox("👁️ Headed Mode (Show Browser)")
        self.headed_cb.setChecked(True)
        
        for cb in [self.cloud_cb, self.headed_cb]:
            cb.setStyleSheet("""
                QCheckBox {
                    color: white;
                    font-size: 12px;
                }
                QCheckBox::indicator {
                    width: 16px;
                    height: 16px;
                }
                QCheckBox::indicator:unchecked {
                    border: 2px solid #555;
                    border-radius: 3px;
                    background: #2a2a2a;
                }
                QCheckBox::indicator:checked {
                    border: 2px solid #667eea;
                    border-radius: 3px;
                    background: #667eea;
                }
            """)
        
        options_row.addWidget(self.cloud_cb)
        options_row.addWidget(self.headed_cb)
        options_row.addStretch()
        task_layout.addLayout(options_row)
        
        layout.addWidget(task_group)

        # Status and Progress
        status_frame = QFrame()
        status_frame.setStyleSheet("""
            QFrame {
                background: #2a2a2a;
                border: 1px solid #555;
                border-radius: 8px;
                padding: 10px;
            }
        """)
        status_layout = QHBoxLayout(status_frame)
        
        self.status_lbl = QLabel("💤 Ready to assist you")
        self.status_lbl.setStyleSheet("color: #4CAF50; font-weight: bold; font-size: 14px;")
        status_layout.addWidget(self.status_lbl)
        
        self.progress = QProgressBar()
        self.progress.setVisible(False)
        self.progress.setStyleSheet("""
            QProgressBar {
                border: 2px solid #555;
                border-radius: 5px;
                text-align: center;
                background: #2a2a2a;
            }
            QProgressBar::chunk {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, 
                    stop:0 #667eea, stop:1 #764ba2);
                border-radius: 3px;
            }
        """)
        status_layout.addWidget(self.progress)
        
        layout.addWidget(status_frame)

        # Logs Section
        logs_group = QGroupBox("📋 Activity Log")
        logs_group.setStyleSheet("""
            QGroupBox {
                font-weight: bold;
                border: 2px solid #555;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px 0 5px;
            }
        """)
        logs_layout = QVBoxLayout(logs_group)
        
        self.log = QTextEdit()
        self.log.setReadOnly(True)
        self.log.setStyleSheet("""
            QTextEdit {
                background: #1a1a1a;
                border: 1px solid #555;
                border-radius: 8px;
                color: #e0e0e0;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 12px;
                padding: 10px;
            }
        """)
        logs_layout.addWidget(self.log)
        
        layout.addWidget(logs_group)

        # Footer
        footer = QLabel("Made with ❤️ by SAKMOTO | Powered by Browser-Use")
        footer.setStyleSheet("""
            QLabel {
                color: #888;
                font-size: 11px;
                background: transparent;
            }
        """)
        footer.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        layout.addWidget(footer)

        self.run_btn.clicked.connect(self.on_run)
        
        # Add some initial welcome message
        self.append_log("🎉 Welcome to Qubit AI Browser!")
        self.append_log("💡 Enter a task above and click 'Run Task' to get started.")
        self.append_log("🔧 Use 'Headed Mode' to see the browser in action.")
        
        # Hide splash screen after a delay
        QTimer.singleShot(2000, self.hide_splash)

    def append_log(self, line: str) -> None:
        self.log.append(f"[{self.get_timestamp()}] {line}")
        # Auto-scroll to bottom
        cursor = self.log.textCursor()
        cursor.movePosition(cursor.MoveOperation.End)
        self.log.setTextCursor(cursor)

    def get_timestamp(self) -> str:
        from datetime import datetime
        return datetime.now().strftime("%H:%M:%S")

    def on_done(self, success: bool, summary: str) -> None:
        # Hide splash screen when task is done
        if hasattr(self, 'splash'):
            self.splash.close()
            
        if success:
            self.status_lbl.setText("✅ Task completed successfully!")
            self.status_lbl.setStyleSheet("color: #4CAF50; font-weight: bold; font-size: 14px;")
        else:
            self.status_lbl.setText("❌ Task failed")
            self.status_lbl.setStyleSheet("color: #f44336; font-weight: bold; font-size: 14px;")
        
        self.progress.setVisible(False)
        if summary:
            self.append_log(f"[summary] {summary}")
        self.run_btn.setEnabled(True)
        self.run_btn.setText("🚀 Run Task")

    def hide_splash(self):
        """Hide the splash screen and show the main window"""
        self.splash.close()
        self.show()
        self.raise_()
        self.activateWindow()

    def show_task_splash(self, task: str):
        """Show splash screen during task execution"""
        self.splash = QubitSplashScreen()
        self.splash.show()
        self.splash.showMessage(f"Executing: {task[:30]}...", 
                              Qt.AlignmentFlag.AlignBottom | Qt.AlignmentFlag.AlignCenter, 
                              QColor(255, 255, 255))
        # Center the splash screen
        self.splash.move(
            (self.splash.screen().geometry().width() - self.splash.width()) // 2,
            (self.splash.screen().geometry().height() - self.splash.height()) // 2
        )

    def on_run(self) -> None:
        task = self.task_input.text().strip()
        if not task:
            return
        self.run_btn.setEnabled(False)
        self.run_btn.setText("⏳ Running...")
        self.log.clear()
        self.status_lbl.setText("🚀 Executing your task...")
        self.status_lbl.setStyleSheet("color: #2196F3; font-weight: bold; font-size: 14px;")
        self.progress.setVisible(True)
        self.progress.setRange(0, 0)  # Indeterminate progress
        
        # Show splash screen during task execution
        self.show_task_splash(task)
        
        use_cloud = self.cloud_cb.isChecked()
        headed = self.headed_cb.isChecked()
        channel = None

        if use_cloud and not os.environ.get("BROWSER_USE_API_KEY"):
            self.append_log("⚠️ Set BROWSER_USE_API_KEY or disable cloud mode.")
            self.run_btn.setEnabled(True)
            self.run_btn.setText("🚀 Run Task")
            self.progress.setVisible(False)
            self.splash.close()
            return

        self.worker = AgentThread(task, use_cloud, headed, channel)
        self.worker.log_signal.connect(self.append_log)
        self.worker.done_signal.connect(self.on_done)
        self.worker.start()

    def get_dark_theme(self) -> str:
        return """
            QMainWindow {
                background-color: #1e1e1e;
                color: #e0e0e0;
            }
            QWidget {
                background-color: #1e1e1e;
                color: #e0e0e0;
            }
        """


