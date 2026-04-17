# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All Python commands assume the project venv is activated (`source .venv/bin/activate`).

**Backend (run from project root):**
- `python manage.py runserver` — Django dev server on `:8000`
- `python manage.py test` — run all Django tests
- `python manage.py test game24_server.tests.test_solver.TestSolver.test_simple` — run a single test (dotted path)
- `LOG_LEVEL=DEBUG python manage.py test` — tests honor `LOG_LEVEL` env var (configured in `tests/test_solver.py::setUpModule`)
- `python manage.py collectstatic --noinput` — needed before serving the Angular bundle from Django
- `python game24_server/solver.py 1 2 3 4` — run the solver standalone from the CLI

**Frontend (run from `game24_app/`):**
- `npm start` — Angular dev server on `:4200` (binds to `0.0.0.0`); proxies `/game24` → `http://localhost:8000` per `proxy.conf.json`, so Django must be running too
- `npm test` — headless Karma/Jasmine, single run
- `npm run build` — production build into `dist/game24-app/browser` (also where Django reads it from)
- `npm run watch` — development build, file-watching

**Deploy:**
- `./deploy.sh` — builds via Cloud Build, pushes to Artifact Registry (`us-west1`), deploys to Cloud Run service `game24-app` in GCP project `austin-test-450819`. Reads production env from `env.yaml` (untracked).
- `docker build .` — local image build (multi-stage: Node → Python). Uses `.env.dev` for local Docker runs.

**Pre-commit:** `pre-commit install` once after clone. Hooks run Black, Prettier, **and the full Django + Angular test suites** on every commit (see `.pre-commit-config.yaml`) — commits will fail if tests fail.

## Architecture

**Single-process deployment, two-server development.** In production, one Django/Gunicorn process serves both the REST API *and* the Angular SPA. In development, you run Django and `ng serve` separately and let Angular proxy API calls to Django.

**Build pipeline that ties them together:**
1. `npm run build` emits the Angular bundle into `game24_app/dist/game24-app/browser/`.
2. Django's `core/settings.py` registers that directory in both `TEMPLATES.DIRS` (so `index.html` is a Django template) and `STATICFILES_DIRS` (so JS/CSS get picked up by `collectstatic`).
3. `core/urls.py` routes `/game24/...` to the API and `re_path(r"^.*$", TemplateView(template_name="index.html"))` catches everything else for Angular client-side routing. `manage-game24/` is the admin URL (renamed from `admin/`).
4. WhiteNoise serves the hashed static assets in production; the production Angular build uses `baseHref: "/static/"` (see `angular.json`) to match.

**API surface is intentionally tiny:** one endpoint, `GET /game24/solve/<comma-separated-numbers>/`, defined in `game24_server/views.py` and routed in `game24_server/urls.py`. It returns `{input, solution_count, solutions}`.

**Solver (`game24_server/solver.py`):** recursive enumeration over operand permutations and the four arithmetic ops. Correctness depends on the deduplication heuristics in `Expression.should_skip()` — commutativity (`a+b == b+a`), associativity normalization (`1-(2+3)` ≡ `(1-2)+3`), identity ops (`n-0`, `n/1`), division by zero, and operand-index ordering on chained same-precedence ops. When changing the solver, `tests/test_solver.py` pins exact expected solution sets — adjust both together.

**Frontend structure:** standalone Angular components, zoneless change detection, Angular Material. The interesting piece is `app/services/config.service.ts`, which sniffs `window.chrome?.runtime?.id` to switch the API base URL — the same Angular code is also bundled into a separate Chrome extension (`../chrome_ext/game24ts`) that calls the production API directly. Don't hardcode `/game24/solve/` elsewhere; go through `ConfigService.urlBase`.

**Secrets and env vars:**
- Cloud Run is detected via the `K_SERVICE` env var. When present, `SECRET_KEY` is fetched from Google Secret Manager (`GCP_PROJECT_ID` + `SECRET_KEY_NAME` from `env.yaml`).
- Locally, `DJANGO_SECRET_KEY` env var is used, with an insecure default fallback.
- `DJANGO_ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` are comma-separated env vars, parsed in `settings.py`.
- In `DEBUG=True`, `django-allow-cidr` is added to allow `192.168.1.0/24` (LAN testing).

## Conventions

- Python formatting: **Black** (pre-commit). The `.prettierrc.json` at the root applies to TS/HTML/SCSS/JSON under `game24_app/` only (see the file-pattern in `.pre-commit-config.yaml`).
- Angular Prettier overrides live in `game24_app/package.json` (`printWidth: 100`, `singleQuote: true`, angular parser for `.html`) — these win over the root `.prettierrc.json` for files in `game24_app/`.
- Database is SQLite (`db.sqlite3`, gitignored). There are no app-level models — `game24_server/models.py` is empty. The DB exists only because Django's auth/sessions/admin require it.
