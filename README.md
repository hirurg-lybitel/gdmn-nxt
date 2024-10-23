<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=800&size=32&pause=1000&color=C9D1D9&random=false&width=600&lines=Gedemin+CRM;Построено+на+знаменитой+платформе;Версия+1.0.0" alt="Typing SVG" />

![image](https://github.com/gsbelarus/gdmn-nxt/assets/11502258/552f3ae1-2ac2-4615-9c10-7c9766d6c58e)

## Установка и запуск
 - скачать и устанoвить [nodejs](https://nodejs.org/en/download/)
 - скачать и установить [firebird 3](https://firebirdsql.org/en/firebird-3-0/)
 - установить Docker
 - установить yarn:
 ```
 npm install --global yarn
 ``` 
 - установить все необходимые зависимости для проекта, перейдя в корневой каталог и запустив:
 ```
 yarn
 ```
 - установить настройки проекта в файлах `.env`, `.env.dev`, `.env.prod`, создав копии соответствующих файлов `.env.sample`, `.env.dev.sample`, `.env.prod.sample` с примерами
 - запустить redis сервер для хранения express сессий:
    * настроить сеть
     ```
      yarn docker:network
     ```
    * запустить контейнер redis
     ```
      yarn docker:redis
     ```
 - запустить проект:
    * в режиме разработчика 
     ```
     yarn start:dev
     ```
    * в режиме продакшена (доступ по сети)
     ```
     yarn start:prod
     ```
    * запуск в режиме раздачи сервером статического файла (доступ по сети)
     ```
     yarn build
     yarn pm2:start
     ```

## Запуск docker контейнеров
Для быстрого разворачивания проекта можно запустить контейнеры, основанные на уже готовых образах.

Чтобы каждый контейнер мог видеть друг друга, они все должны быть подключены к docker сети `proxy_network` типа `bridge`.

Так же для обработки сетевых запросов необходим простейший `reverse-proxy`, пересылающий запросы на соответствующие контейнеры по внутренним именам `crm_client` и `crm_server`.

Базовый пример такого `reverse-proxy` можно [посмотреть тут](https://github.com/hirurg-lybitel/proxy-router).

Для текущего проекта есть [уже настроенный `reverse-proxy`](https://github.com/hirurg-lybitel/gdmn-proxy-server), который создаёт необходимую `docker сеть`, а также имеет уже всю необходимую маршрутизацию.

После запуска любого `reverse-proxy` и создания сети запускаем crm контейнеры:
```
yarn docker:run
```

Всего дожно быть запщуено четыре контейнера:
- `proxy` для обработки сетевых запросов
- `session-store` для хранения пользовательских сессий
- `crm_client` и `crm_server`
  
![image](https://github.com/user-attachments/assets/482b733b-adf7-4027-ba23-94d4cde6354f)


## SSl сертификаты
Так как программа работает по защищённому протоколу HTTPS для её работы необходимо наличие файлов сертификата.
Это могу быть как выданные официально сертификаты, так и самоподписанные.
Убедитесь, что в корне проекта у вас есть папка ssl со следующим содержимым:
- public.crt (сам сертификат)
- private.key (приватный ключ сертификата)
- ca.bundle (корневой и промежуточный сертификаты. Для самоподписанных - копия public.crt)

![image](https://github.com/gsbelarus/gdmn-nxt/assets/11502258/8775e08e-c443-483b-913a-e6ad88194b6d)


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
