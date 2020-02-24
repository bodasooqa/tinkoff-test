<img src="https://psv4.userapi.com/c856332/u391253330/docs/d16/f7a6c5862195/Bez_imeni-1.png?extra=buvRJYgi6d-XVgXyWHGvlk1MhHvpa21-wssOhSdn1GJXC8FzabKZg_nWWqkq-7imNQ8AUKCAbjJeHFgq58w6dB2qOdfUEKjE9CWd7mdQw1Pvd_s2r55bPjawLixidTUXehArdcCBt1bvM5kZCnfEeCilBA" alt="logo" />

# Tinkoff Test


Приложение представляет из себя SPA, которое отображает в виде линейного графика данные о средней температуре и уровне осадков в определенном городе России.

График реализован с помощью *canvas*, без использования сторонних библиотек. 
Для управления отображением используется слайдер, расположенный под графиком: он имеет края, с помощью которых изменяется диапазон выводимых данных.
Отрисовка *canvas* оптимизирована всеми известными мне способами, например, пререндеринг, отказ от дробных значений координат.

Для изменения кол-ва координат на графике температуры меняется свойство `TEMP_STEP` в `src/environments/environment.ts`. 

При реализации использованы: *web workers, canvas, svg, "On Push" CD Strategy, Angular Router*.

Angular 9.0.0, Angular CLI 9.0.1.

Данные берутся с Node.js (nest.js) сервера:
https://github.com/bodasooqa/tinkoff-test-server 

## Demo

https://tinkoff-test.now.sh

## Management

`npm start` — запускает dev server.

`npm run build` — сборка приложения в каталог *dist/*.

`npm run now` — деплой приложения с помощью сервиса [Zeit](https://zeit.co/bodasooqa).

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
