# Gedemin CRM

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub package version](https://img.shields.io/github/package-json/v/gsbelarus/gdmn-nxt?style=flat-square)](https://github.com/gsbelarus/gdmn-nxt/)

![image](https://user-images.githubusercontent.com/11502258/204565528-24a71789-4bb5-4072-a201-511ea5e921cd.png)

## Установка и запуск
 - скачать и установить [nodejs](https://nodejs.org/en/download/)
 - скачать и установить [firebird 3](https://firebirdsql.org/en/firebird-3-0/)
 - установить yarn:
 ```
 npm install --global yarn
 ``` 
 - установить все необходимые зависимости для проекта, перейдя в корневой каталог и запустив:
 ```
 yarn --network-timeout 1000000
 ```
 - установить настройки проекта в файле `.env`, создав копию файла `.env.sample` с примерами
 - запустить проект:
 ```
 yarn start
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
