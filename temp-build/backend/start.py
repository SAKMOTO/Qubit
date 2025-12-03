"""
Auto Setup Script for Qubit + OpenHands Desktop App
This script handles virtual environment creation, dependency installation,
and starts both backends silently in the background.
"""
import os
import sys
import subprocess
import platform
import time
import signal

def run_cmd(cmd, check=True):
    """Run a command and optionally check for errors."""
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if check and result.returncode != 0:
        print(f"❌ Error: {result.stderr}")
        return False
    return True

def run_background(cmd, cwd=None, env=None):
    """Run a command in the background with output visible."""
    process_env = os.environ.copy()
    if env:
        process_env.update(env)
    
    if platform.system() == "Windows":
        # Windows: Create process without console window
        process = subprocess.Popen(
            cmd,
            creationflags=subprocess.CREATE_NO_WINDOW | subprocess.DETACHED_PROCESS,
            shell=True,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=process_env
        )
    else:
        # macOS/Linux: Run in background but capture output for debugging
        process = subprocess.Popen(
            cmd,
            shell=True,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            start_new_session=True,
            env=process_env
        )
        # Log output in background
        def log_output(pipe, prefix):
            for line in iter(pipe.readline, ''):
                if line:
                    print(f"[{prefix}] {line.strip()}")
        
        import threading
        threading.Thread(target=log_output, args=(process.stdout, "STDOUT"), daemon=True).start()
        threading.Thread(target=log_output, args=(process.stderr, "STDERR"), daemon=True).start()
    
    return process

def main():
    """Main setup and startup function."""
    print("🚀 Starting Qubit + OpenHands Auto Setup...")
    
    # Determine paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    venv_dir = os.path.join(root_dir, "venv")
    
    # Determine Python executable path
    if platform.system() == "Windows":
        python_exec = os.path.join(venv_dir, "Scripts", "python.exe")
        pip_exec = os.path.join(venv_dir, "Scripts", "pip.exe")
    else:
        python_exec = os.path.join(venv_dir, "bin", "python")
        pip_exec = os.path.join(venv_dir, "bin", "pip")
    
    # Create virtual environment if it doesn't exist
    if not os.path.exists(venv_dir):
        print("📦 Creating virtual environment...")
        if not run_cmd(f'"{sys.executable}" -m venv "{venv_dir}"'):
            print("❌ Failed to create virtual environment")
            return
    else:
        print("✅ Virtual environment already exists")
    
    # Check for Qubit in Desktop location first
    desktop_qubit = os.path.expanduser("~/Desktop/Qubit")
    local_qubit = os.path.join(script_dir, "Qubit_backend", "Qubit")
    
    # Install Qubit backend dependencies (integration wrapper)
    qubit_requirements = os.path.join(script_dir, "Qubit_backend", "requirements.txt")
    if os.path.exists(qubit_requirements):
        print("📥 Installing Qubit backend dependencies...")
        run_cmd(f'"{pip_exec}" install --upgrade pip', check=False)
        run_cmd(f'"{pip_exec}" install -r "{qubit_requirements}"')
    
    # Install Qubit's own requirements - check Desktop location first
    qubit_requirements_paths = [
        os.path.join(desktop_qubit, "requirements.txt"),
        os.path.join(desktop_qubit, "qubit_desktop", "requirements.txt"),
        os.path.join(local_qubit, "requirements.txt"),
    ]
    
    qubit_requirements_found = None
    for req_path in qubit_requirements_paths:
        if os.path.exists(req_path):
            qubit_requirements_found = req_path
            break
    
    if qubit_requirements_found:
        print("📥 Installing Qubit application dependencies...")
        print(f"   Installing from: {qubit_requirements_found}")
        run_cmd(f'"{pip_exec}" install -r "{qubit_requirements_found}"')
    else:
        print(f"⚠️  Qubit requirements not found")
        print(f"   Checked: {qubit_requirements_paths}")
    
    # Install Playwright (this can take time, so run it but don't fail if it errors)
    print("🎭 Installing Playwright browsers...")
    print("   (This may take a few minutes on first run)")
    run_cmd(f'"{python_exec}" -m playwright install --with-deps', check=False)
    
    # Install OpenHands and uv
    print("🤖 Installing OpenHands and uv...")
    run_cmd(f'"{pip_exec}" install openhands uv')
    
    # Install global requirements if exists
    global_requirements = os.path.join(script_dir, "requirements.txt")
    if os.path.exists(global_requirements):
        print("📥 Installing global requirements...")
        run_cmd(f'"{pip_exec}" install -q -r "{global_requirements}"')
    
    # Start Qubit backend - Check multiple possible locations
    desktop_qubit = os.path.expanduser("~/Desktop/Qubit")
    local_qubit = os.path.join(script_dir, "Qubit_backend", "Qubit")
    qubit_wrapper = os.path.join(script_dir, "Qubit_backend", "main.py")
    
    qubit_process = None
    qubit_venv_path = None
    qubit_dir = None
    
    # Try Desktop/Qubit first (your actual application location)
    if os.path.exists(desktop_qubit):
        qubit_dir = desktop_qubit
        qubit_venv_path = os.path.join(desktop_qubit, "qubit_desktop", ".venv")
        
        # Check if it has the qubit_desktop module
        qubit_desktop_main = os.path.join(desktop_qubit, "qubit_desktop", "main.py")
        if os.path.exists(qubit_desktop_main):
            print(f"✅ Found Qubit at: {desktop_qubit}")
            print("🚀 Starting Qubit desktop application...")
            
            # Set environment variables
            env = os.environ.copy()
            env['PYTHONPATH'] = desktop_qubit
            env['BROWSER_USE_API_KEY'] = os.environ.get('BROWSER_USE_API_KEY', 'bu_iQgbGmDNq1LeEPtaY9Fk7FdGNCKXBZrH0INbDtGsx4I')
            
            # Use venv Python if available, otherwise use main venv
            if os.path.exists(qubit_venv_path):
                qubit_python = os.path.join(qubit_venv_path, "bin", "python")
                if os.path.exists(qubit_python):
                    python_exec = qubit_python
                    print(f"   Using Qubit's venv: {qubit_python}")
            
            # Launch the ACTUAL Qubit Python Desktop App (PyQt6) - PRIMARY WINDOW
            print("   🖥️  Launching Qubit Python Desktop App (PyQt6)...")
            print("   📱 This is your actual Qubit browser - will open as primary window")
            
            # Verify PyQt6 WebEngine is available
            check_cmd = f'"{python_exec}" -c "import PyQt6.QtWebEngineWidgets as w; print(\'WebEngine OK\')"'
            check_result = subprocess.run(check_cmd, shell=True, capture_output=True, text=True, env=env)
            
            if "WebEngine OK" in check_result.stdout:
                print("   ✅ PyQt6 WebEngine verified")
            else:
                print("   ⚠️  PyQt6 WebEngine check failed, but continuing...")
            
            # Launch the Python desktop application - THIS IS THE PRIMARY APP
            print("   🚀 Starting: python -m qubit_desktop.main")
            
            # For macOS - launch GUI app properly
            if platform.system() == "Darwin":  # macOS
                # Launch the PyQt6 app - it will create its own native window
                qubit_process = subprocess.Popen(
                    [python_exec, "-m", "qubit_desktop.main"],
                    cwd=desktop_qubit,
                    env=env,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    start_new_session=False  # Keep in same session
                )
            else:
                # Linux/Windows
                qubit_process = subprocess.Popen(
                    [python_exec, "-m", "qubit_desktop.main"],
                    cwd=desktop_qubit,
                    env=env,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
            
            # Log output from Python desktop app
            def log_desktop_output(pipe, prefix):
                try:
                    for line in iter(pipe.readline, ''):
                        if line:
                            print(f"[Qubit Python App] {line.strip()}")
                except:
                    pass
            
            import threading
            threading.Thread(target=log_desktop_output, args=(qubit_process.stdout, "STDOUT"), daemon=True).start()
            threading.Thread(target=log_desktop_output, args=(qubit_process.stderr, "STDERR"), daemon=True).start()
            
            time.sleep(3)  # Give it time to launch GUI window
            print("   ✅ Qubit Python Desktop App launched!")
            print("   🖥️  Your actual Qubit browser window should now be visible")
            
            if qubit_process:
                print("   ⏳ Waiting for Qubit Python app to initialize...")
                time.sleep(2)
                print("✅ Qubit Python Desktop App started (PRIMARY WINDOW)")
    
    # Fallback to local Qubit if Desktop version not found
    if qubit_process is None:
        qubit_main = os.path.join(local_qubit, "main.py")
        
        if os.path.exists(qubit_main):
            print(f"🚀 Starting Qubit backend (local) on http://127.0.0.1:8000...")
            print(f"   Working directory: {local_qubit}")
            qubit_process = run_background(
                f'"{python_exec}" -m uvicorn main:app --host 127.0.0.1 --port 8000',
                cwd=local_qubit
            )
            print("   ⏳ Waiting for Qubit to start...")
            time.sleep(5)
            print("✅ Qubit backend process started")
        elif os.path.exists(qubit_wrapper):
            print("🚀 Starting Qubit backend (wrapper) on http://127.0.0.1:8000...")
            qubit_process = run_background(
                f'"{python_exec}" -m uvicorn Qubit_backend.main:app --host 127.0.0.1 --port 8000',
                cwd=script_dir
            )
            time.sleep(3)
            print("✅ Qubit backend process started")
        else:
            print(f"❌ Qubit not found!")
            print(f"   Checked: {desktop_qubit}")
            print(f"   Checked: {local_qubit}")
            print(f"   Checked: {qubit_wrapper}")
            print(f"   Please ensure Qubit folder exists at one of these locations")
            qubit_process = None
    
    # Start OpenHands server
    print("🚀 Starting OpenHands server on http://127.0.0.1:3000...")
    openhands_process = run_background(
        f'"{python_exec}" -m uvx --python "{python_exec}" openhands serve',
        cwd=root_dir
    )
    time.sleep(3)  # Give it time to start
    print("✅ OpenHands server started")
    
    print("\n🎉 Setup complete! Both services are running in the background.")
    print("   Qubit API: http://127.0.0.1:8000")
    print("   OpenHands: http://127.0.0.1:3000")
    print("\n⚠️  Keep this window open or the services will stop.")
    
    # Keep script running (services will continue in background)
    # On Windows, we need to keep the process alive
    try:
        if platform.system() == "Windows":
            # On Windows, wait for processes
            if qubit_process:
                qubit_process.wait()
            openhands_process.wait()
        else:
            # On Unix, wait indefinitely
            signal.pause()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down services...")
        if qubit_process:
            qubit_process.terminate()
        openhands_process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()

