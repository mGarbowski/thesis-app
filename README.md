# Setosa - demo systemu rozpoznawania twarzy

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
  * przeglądanie zdjęć zapisanych w bazie

## Instalacja i uruchomienie

### Wymagania

* [Docker](https://docs.docker.com/)
* [uv](https://docs.astral.sh/uv/)
* [just](https://github.com/casey/just)

### Uruchomienie w trybie produkcyjnym

Aplikacja jest skonteneryzowana. Składa się z trzech kontenerów:

* `db` - Baza danych PostgreSQL z wtyczką pgvector
* `backend` - aplikacja FastAPI z modelami ML detekcji i ekstrakcji cech
* `nginx` - serwer HTTP serwujący aplikację frontendową i reverse proxy do aplikacji backendowej.

```shell
just run
```

Aplikacja będzie dostępna pod adresem <http://localhost:8000>

### Uruchomienie w trybie deweloperskim

Do rozwoju aplikacji, wspiera przeładowanie kodu przy jego zmianie.

#### Uruchomienie deweloperskiej bazy danych

W kontenerze Docker

Z katalogu `backend`

```shell
just db
```

#### Aplikacja backend

W katalogu `backend`

```shell
cd backend
```

Instalacja zależności (w tym deweloperskich, wersje z pliku uv.lock)

```shell
just install
```

Uruchomienie aplikacji backend

```shell
just dev
```

Automatycznie wygenerowana dokumentacja API (Swagger UI) będzie dostępna pod adresem <http://localhost:8000/docs>

Uruchomienie testów

```shell
just test
```

Uruchomienie testów z raportem pokrycia kodu

```shell
just cov
```

Uruchomienie formatera

```shell
just fmt
```

Sprawdzenie formatowania i typów

```shell
just check
```

Metryki kodu (liczba linijek, złożoność cyklomatyczna itp.)

```shell
just metrics_all
```

Pozostałe komendy

```shell
just -l
```

#### Aplikacja frontend

W katalogu `frontend`

```shell
cd frontend
```

Instalacja NodeJS i NPM - instrukcja w [dokumentacji NodeJS](https://nodejs.org/en/download)

Instalacja zależności (wersje z pliku package-lock.json)

```shell
just install
```

Uruchomienie aplikacji frontend

```shell
just dev
```

Zbudowanie aplikacji

```shell
just build
```

Uruchomienie formatera i lintera

```shell
just fmt
```

Sprawdzenie formatowania i lintera

```shell
just check
```
