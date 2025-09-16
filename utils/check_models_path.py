#!/usr/bin/env python3

from app import app
import models
import inspect


def check_models_path():
    with app.app_context():
        print("=== CHECKING MODELS PATH ===")
        print(f"models module file: {models.__file__}")
        print(f"Pedido class: {models.Pedido}")
        print(f"Pedido to_dict method: {models.Pedido.to_dict}")

        # Get source of to_dict method
        try:
            source = inspect.getsource(models.Pedido.to_dict)
            print(f"to_dict source preview: {source[:200]}...")
        except:
            print("Could not get source")


if __name__ == "__main__":
    check_models_path()
