import urllib.request
import json
import sys

try:
    with urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=5) as response:
        html = response.read().decode('utf-8')
        print("Success:", html)
except Exception as e:
    print("Error:", e)
    sys.exit(1)
