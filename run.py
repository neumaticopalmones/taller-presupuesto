from app import app

if __name__ == "__main__":
    # Corre la aplicación en modo de depuración para desarrollo.
    # Escucha en todas las interfaces de red (0.0.0.0).
    app.run(host='0.0.0.0', port=5000, debug=True)
