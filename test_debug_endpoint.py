#!/usr/bin/env python3
import requests

url = "http://127.0.0.1:5000/pedidos"
print(f"Haciendo petición a: {url}")

try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print("--- Primera parte del response ---")
    print(response.text[:500])
    print("--- Final de la primera parte ---")
except Exception as e:
    print(f"Error: {e}")
