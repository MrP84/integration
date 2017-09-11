# Configuration front-end Gulp Archriss

![Gulp boilerplate](http://i.imgur.com/ZxMhXG2.png)

## Fonctionnalités

* Rechargement instantané des modifications via [livereload](http://livereload.com/extensions/)
* Compilation SASS et amélioration du code avec [postCSS](https://github.com/postcss/postcss)
* Linter Javascript par [eslint](https://eslint.org/)
* Transpilation ES6/ES7 en ES5 via [Babel](https://babeljs.io/)
* Obsfuscation du JS en prod (renommage des variables et fonctions...)
* Concaténation des CSS et des JS
* Compression des images lors du build avec [imagemin](https://github.com/imagemin/imagemin)

## Pré-requis

* [node.js and npm](https://nodejs.org/en/download/)
* [Plugin livereload](http://livereload.com/extensions/) pour profiter du rechargement instantané

## Démarrer le projet

    $ git clone https://github.com/archriss/gulp-frontend-kit
    $ cd gulp-frontend-kit
    $ npm install
    
## Configuation de livereload

### Google Chrome

Pour que le livereload fonctionne sans serveur local (en ouvrant un fichier html directement par exemple), il faut penser à cocher "autoriser l'accès aux URL de fichier" dans les paramètres des extensions.

![Livereload](https://puu.sh/r6enB/5bd567da38.png)

### Firefox

Pour que le livereload fonctionne, il est nécessaire d'activer le plugin depuis la barre des tâches.

![Livereload](https://imgur.com/3nwC3jG.png)

## Commandes du projet

### Développement

`npm run watch` va démarrer un serveur livereload et compiler sans minifier/uglifier les fichiers pour pouvoir débugger. Les images ne sont pas non plus compressées.

### Déploiemement

`npm run build` va compiler et minifier tous les fichiers, et va compresser les images.

## Liste des tâches automatisées

Tâche | Description
------ | ------
`cleanDist` | Supprime le contenu de `/dist/dev` ou `/dist/prod` au lancement de gulp
`minifyImages` | Minifie les images contenues dans `/src/assets/img` avec imagemin
`copyAssets` | Duplique les assets (fonts, sons, vidéos...) dans le dossier`/dist/dev` ou `/dist/prod`
`css` | Compile le SASS et traite le tout avec postCSS, génère les sourcemaps en dev, et minifie en prod
`JSVendor` | Concatène les JS externes et génère un fichier `vendor.js`
`JSCode` | Compile votre code ES6/7 avec Babel, génère les sourcemaps en dev, et minifie en prod
`html` | Surveille les modifications des fichiers html pour le livereload (dev uniquement)
