from fastapi import FastAPI, HTTPException
import requests
from fastapi.responses import JSONResponse

# Create FastAPI instance with custom docs and OpenAPI URLs
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

# URL der JSON-Daten
DATA_URL = "https://data.stadt-zuerich.ch/dataset/ugz_meteodaten_tagesmittelwerte/download/uzg_ogd_metadaten.json"

# Route, um die JSON-Daten vom Server zu laden und bereitzustellen
@app.get("/api/py/meteodaten")
def meteodaten():
    try:
        # Anfrage an die externe URL
        response = requests.get(DATA_URL)
        response.raise_for_status()  # Überprüfen, ob die Anfrage erfolgreich war
        data = response.json()  # JSON-Daten parsen
        return JSONResponse(content=data)  # Daten als JSON-Antwort zurückgeben
    except requests.exceptions.RequestException as e:
        # Fehler behandeln, wenn die Anfrage fehlschlägt
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der Daten: {e}")

# Test-Route, um die API zu überprüfen
@app.get("/api/py/test")
def test_endpoint():
    return {"message": "Test erfolgreich"}
