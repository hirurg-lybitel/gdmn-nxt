# Gedemin CRM

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub package version](https://img.shields.io/github/package-json/v/gsbelarus/gdmn-nxt?style=flat-square)](https://github.com/gsbelarus/gdmn-nxt/)

![image](https://github.com/gsbelarus/gdmn-nxt/assets/11502258/552f3ae1-2ac2-4615-9c10-7c9766d6c58e)


## Установка и запуск
 - скачать и установить [nodejs](https://nodejs.org/en/download/)
 - скачать и установить [firebird 3](https://firebirdsql.org/en/firebird-3-0/)
 - установить yarn:
 ```
 npm install --global yarn
 ``` 
 - установить все необходимые зависимости для проекта, перейдя в корневой каталог и запустив:
 ```
 yarn
 ```
 - установить настройки проекта в файлах `.env`, `.env.dev`, `.env.prod`, создав копии соответствующих файлов `.env.sample`, `.env.dev.sample`, `.env.prod.sample` с примерами
 - запустить проект:
    * в режиме разработчика 
     ```
     yarn start:dev
     ```
    * в режиме продакшена (доступ по сети)
     ```
     yarn start:prod
     ```
    * запуск докер контейнера (доступ по сети)
     ```
     yarn docker:build
     ```
     * запуск в режиме раздачи сервером статического файла (доступ по сети)
     ```
     yarn build
     yarn pm2:start
     ```          
 
 ## Памятка разработчика
 Используемая семантика коммитов
```
feat: add hat wobble
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
```
- `feat`: (new feature for the user, not a new feature for build script)
- `fix`: (bug fix for the user, not a fix to a build script)
- `docs`: (changes to the documentation)
- `style`: (formatting, missing semi colons, etc; no production code change)
- `refactor`: (refactoring production code, eg. renaming a variable)
- `test`: (adding missing tests, refactoring tests; no production code change)
- `chore`: (updating grunt tasks etc; no production code change)
