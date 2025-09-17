import datetime as _dt
import importlib.util
import os
import pathlib
import sys

import pytest

# Forzar uso de SQLite en memoria antes de importar la app
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

try:
    from app import Cliente, Presupuesto, app, db  # type: ignore
except ModuleNotFoundError:
    # Carga manual si el import directo falla (nombre de carpeta con espacios, etc.)
    ROOT = pathlib.Path(__file__).resolve().parents[1]
    app_path = ROOT / "app.py"
    spec = importlib.util.spec_from_file_location("app", app_path)
    module = importlib.util.module_from_spec(spec)  # type: ignore
    sys.modules["app"] = module  # type: ignore
    assert spec and spec.loader
    spec.loader.exec_module(module)  # type: ignore
    app = module.app  # type: ignore
    db = module.db  # type: ignore
    Cliente = module.Cliente  # type: ignore
    Presupuesto = module.Presupuesto  # type: ignore


@pytest.fixture()
def client(monkeypatch):
    app.config["TESTING"] = True

    class _Ultimo:
        def __init__(self):
            self.id = "mock-id"
            self.fecha = _dt.date(2024, 1, 1)

    class FakeQuery:
        def __init__(self, model):
            self.model = model

        def count(self):
            return 1

        def order_by(self, *args, **kwargs):
            return self

        def first(self):
            if self.model is Presupuesto:
                return _Ultimo()
            return None

    class FakeSession:
        def query(self, model):
            return FakeQuery(model)

        def remove(self):
            pass

    monkeypatch.setattr(db, "session", FakeSession(), raising=False)

    with app.test_client() as client:
        yield client


def test_stats_endpoint_basic(client):
    resp = client.get("/stats")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["ok"] is True
    assert "clientes" in data and data["clientes"] == 1
    assert "presupuestos" in data and data["presupuestos"] == 1
    assert "ult_presupuesto" in data
    if data["ult_presupuesto"]:
        assert "id" in data["ult_presupuesto"]
        assert "fecha" in data["ult_presupuesto"]
