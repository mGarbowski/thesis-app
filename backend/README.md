# Backend Application

This is a FastAPI application for face recognition.

## IDE Import Resolution

If your IDE is showing unresolved references for imports like `from app.api import faces_router`, follow these steps:

1. We've added a `setup.py` file to help the IDE recognize the package structure.
2. In your IDE, you may need to:
   - Mark the `backend` directory as a "Sources Root" or "Python Package"
   - Reload the project
   - Restart the IDE

### PyCharm
- Right-click on the `backend` directory
- Select "Mark Directory as" > "Sources Root"

### VS Code
- Make sure the Python extension is installed
- Select the correct Python interpreter (from the .venv directory)
- You may need to create a `.vscode/settings.json` file with:
  ```json
  {
    "python.analysis.extraPaths": ["${workspaceFolder}/backend"]
  }
  ```

### Other IDEs
- Look for options to mark directories as source roots or add them to the Python path

## Running the Application

```bash
# Using PDM script
pdm run dev

# Or directly with FastAPI
fastapi dev
```