@echo off

:: Шаг 1: Добавить удаленный upstream-репозиторий
git remote add upstream https://github.com/gsbelarus/gdmn-nxt

:: Шаг 2: Получить изменения из ветки main исходного репозитория
git fetch upstream

:: Шаг 3: Переключиться на ветку main
git checkout main

:: Шаг 4: Выполнить слияние изменений из ветки main исходного репозитория в вашу ветку main
git merge upstream/main

:: Шаг 5: Отправить изменения в ваш удаленный репозиторий
git push origin main
