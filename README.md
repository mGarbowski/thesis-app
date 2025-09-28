# Demo systemu rozpoznawania twarzy

Mikołaj Garbowski - element pracy dyplomowej inżynierskiej

## Opis

* Aplikacja przechowuje bazę twarzy do dopasowania
  * identyfikator
  * metadane
  * obraz
  * wektor cech wyekstrachowany z obrazu
* Interfejs użytkownika umożliwia
  * dodanie do bazy zdjęcia z kamerki internetowej
  * dodanie do bazy zdjęcia z dysku
  * wyświetlenie najbliższego dopasowania do twarzy ze zdjęcia z kamerki internetowej
  * wyświetlenie najbliższego dopasowania do twarzy ze zdjęcia z dysku

  
## Instalacja i uruchomienie

### Uruchomienie w trybie produkcyjnym

Aplikacja jest skonteneryzowana. Składa się z trzech kontenerów:

* `db` - Baza danych PostgreSQL z wtyczką pgvector 
* `backend` - aplikacja FastAPI z modelami ML detekcji i ekstrakcji cech
* `nginx` - serwer HTTP serwujący aplikację frontendową i reverse proxy do aplikacji backendowej.

```shell
docker compose up --build
```

Aplikacja będzie dostępna pod adresem http://localhost:8000


### Uruchomienie w trybie deweloperskim

Do rozwoju aplikacji, wspiera przeładowanie kodu przy jego zmianie.

#### Uruchomienie deweloperskiej bazy danych

W kontenerze Docker

```shell
docker compose -f database/docker-compose.yml up
```

#### Aplikacja backend

W katalogu `backend`

```shell
cd backend
```

Instalacja narzędzia PDM do zarządzania projektem, zależnościami, środowiskiem wirtualnym itp.

Dokładna, aktualna instrukcja dostępna w [dokumentacji PDM](https://pdm-project.org/latest/)

```shell
curl -sSL https://pdm-project.org/install-pdm.py | python3 -
```

Instalacja zależności (w tym deweloperskich, wersje z pliku pdm.lcok)

```shell
pdm install --dev --frozen-lockfile
```

Uruchomienie aplikacji backend

```shell
pdm dev
```

Uruchomienie testów

```shell
pdm test
```

Pozostałe komendy

```shell
pdm run --list
```

#### Aplikacja frontend

W katalogu `frontend`

```shell
cd frontend
```

Instalacja NodeJS i NPM - instrukcja w [dokumentacji NodeJS](https://nodejs.org/en/download)

Instalacja zależności (wersje z pliku package-lock.json)

```shell
npm ci
```

Uruchomienie aplikacji frontend

```shell
npm run dev
```

Zbudowanie aplikacji

```shell
npm run build
```

Uruchomienie formatera i lintera

```shell
npm run fmt
```

Sprawdzenie formatowania i lintera

```shell
npm run check
```
