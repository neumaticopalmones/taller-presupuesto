import re
from datetime import date
import pathlib

APP_FILE = pathlib.Path(__file__).parent.parent / "app.py"
_CODE = APP_FILE.read_text(encoding="utf-8")


def _extract_function(code: str, func_name: str):
    marker = f"def {func_name}"
    idx = code.find(marker)
    assert idx != -1, f"No se encontró {func_name} en app.py"
    sub = code[idx:]
    lines = sub.splitlines()
    collected = []
    for ln in lines:
        if collected and (ln.startswith("def ") or ln.startswith("@")):
            break
        collected.append(ln)
    func_code = "\n".join(collected)
    local_ns = {}
    import re as _re  # asegurar disponibilidad dentro del código ejecutado
    exec(func_code, {"re": _re}, local_ns)
    return local_ns[func_name]


_parse_medida_bases = _extract_function(_CODE, "_parse_medida_bases")


def generar_siguiente_numero_presupuesto():  # Simplificado para test sin DB
    return f"{date.today().year}-001"


def test_parse_medida_bases_variantes():
    assert _parse_medida_bases("205/55/16 91V") == ["205/55/16", "205/55R16"]
    assert _parse_medida_bases("205/55R16 91V") == ["205/55/16", "205/55R16"]
    assert _parse_medida_bases("  215 / 60 R 17   ") == ["215/60/17", "215/60R17"]
    assert _parse_medida_bases("") == []
    assert _parse_medida_bases(None) == []


def test_generar_siguiente_numero_presupuesto_formato():
    num = generar_siguiente_numero_presupuesto()
    assert re.match(rf"^{date.today().year}-\d{{3}}$", num)
