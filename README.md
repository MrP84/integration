# Configuration front-end Gulp Archriss

![Gulp boilerplate](http://i.imgur.com/ZxMhXG2.png)

## Fonctionnalités

* Rechargement instantané des modifications
* Compilation SASS
* Regroupement des mediaqueries CSS
* Linter Javascript pré-configuré
* Transpilation ES6/ES7 en ES5 via Babel
* Obsfuscation du JS en prod (renommage des variables et fonctions...)
* Concaténation des CSS et des JS
* Ajout de closures en JS entre les fichiers
* Compression des images lors du build

## Pré-requis

* [node.js and npm](https://nodejs.org/en/download/) installed and ready-to-go
* [git](https://git-scm.com/downloads)
* [Livereload plugin for your browser](http://livereload.com/extensions/)
* (optionnel) [eslint](http://eslint.org/) pour la qualité du code JS

### Configuation de livereload

Pour que le livereload fonctionne sans serveur local (en ouvrant un fichier html directement par exemple), il faut penser à cocher "autoriser l'accès aux URL de fichier" dans les paramètres des extensions.

![Livereload](https://puu.sh/r6enB/5bd567da38.png)

## Démarrer le projet

    $ git clone https://github.com/archriss/gulp-frontend-kit
    $ cd gulp-frontend-kit
    $ npm install

## Commandes du projet

### Développement

`npm run watch` va démarrer un serveur livereload et compiler sans minifier/uglifier les fichiers pour pouvoir débugger. Les images ne sont pas non plus compressées.

### Déploiemement

`npm run build` va compiler et minifier tous les fichiers, et va compresser les images.