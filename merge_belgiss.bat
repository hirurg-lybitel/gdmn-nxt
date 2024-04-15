@echo off

:: Для БелГисс

:: Шаг 1: Добавить удаленный upstream-репозиторий
git remote add upstream https://github.com/gsbelarus/gdmn-nxt

:: Шаг 2: Получить изменения из ветки belgiss-prod исходного репозитория
git fetch upstream

:: Шаг 3: Переключиться на ветку belgiss-prod
git checkout belgiss-prod

:: Шаг 4: Выполнить слияние изменений из ветки belgiss-prod исходного репозитория в вашу ветку belgiss-prod
git merge upstream/belgiss-prod

:: Шаг 5: Отправить изменения в ваш удаленный репозиторий
git push origin belgiss-prod
