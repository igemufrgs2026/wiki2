from os import environ, path
from hashlib import sha256
from functools import lru_cache
from pathlib import Path

from flask import Flask, render_template
from flask_frozen import Freezer


template_folder = path.abspath('./wiki')

app = Flask(__name__, template_folder=template_folder)
# Keep published navigation and assets anchored to the team's URL prefix.
app.config['FREEZER_BASE_URL'] = environ.get(
    'WIKI_BASE_URL', 'https://2026.igem.wiki/ufrgs-brazil/'
)
app.config['FREEZER_DESTINATION'] = 'public'
app.config['FREEZER_RELATIVE_URLS'] = False
app.config['FREEZER_IGNORE_MIMETYPE_WARNINGS'] = True
@lru_cache(maxsize=None)
def asset_version(filename):
    return sha256((Path(app.static_folder) / filename).read_bytes()).hexdigest()[:12]


@app.url_defaults
def version_static_assets(endpoint, values):
    filename = values.get('filename', '')
    if endpoint == 'static' and Path(filename).suffix in {'.css', '.js', '.mjs'}:
        values.setdefault('v', asset_version(filename))


freezer = Freezer(app)

@app.cli.command()
def freeze():
    freezer.freeze()

@app.cli.command()
def serve():
    freezer.run()

@app.route('/')
def home():
    return render_template('pages/home.html')

@app.route('/<page>')
def pages(page):
    return render_template(str(Path('pages')) + '/' + page.lower() + '.html')

@freezer.register_generator
def pages_generator():
    pages_dir = Path(template_folder) / 'pages'
    for file in pages_dir.glob('*.html'):
        if file.stem.lower() != 'home':
            yield 'pages', {'page': file.stem.lower()}

# Main Function, Runs at http://0.0.0.0:8080
if __name__ == "__main__":
    app.run(port=8080)
