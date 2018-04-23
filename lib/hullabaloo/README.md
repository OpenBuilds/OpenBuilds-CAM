# Hullabaloo.js

Простой плагин оповещений, который использует стили сдандартных Bootstrap алертов.
Для его создания использовался плагин [bootstrap-growl](https://github.com/ifightcrime/bootstrap-growl).

## Зависимости

1. Latest version of jQuery.
2. [Twitter Bootstrap](http://twitter.github.com/bootstrap/index.html). (current rev tested with 4.0.0)

## Использование

Подключите файл все зависимости и `hullabaloo.js` на свою страницу, Создайте главный объект hullabaloo и вызывайте.

```javascript
$.hulla = new hullabaloo();
$.hulla.send("Добро пожаловать!", "success");
```

## Дополнительные функции

Можно настроить вызов ваших функций в разный момент жизни алерта

```javascript
// Ф-ия выполнится как только алерт выведется на экран, но до того как он исчезнет
$.hulla.options.fnEnd = function() {
    alert("Алерт вывелся и скоро исчезнет")
}

// Ф-ия выполнится еще до появления алерта на экран
$.hulla.options.fnStart = function() {
    alert("Алерт скоро появится");
}

// Ф-ия выполнится как только алерт исчезнет с экрана
$.hulla.options.fnEndHide = function() {
    alert("Алерт закрылся");
}
```

## Опции

Изменение опций по умолчанию

```javascript
$.hulla.options.<опция> = <значение>;
```

Список доступных опций:

| Option        | Default  | Description |
| ------------- | -------- | ----------- |
| width         | _250_    | Ширина алерта |
| delay         | _4000_   | Задержка отображения |
| allow_dismiss | true     | Кнопка закрытия алерта |
| text          |          | Текст по умолчанию |
| icon          |          | Иконка по умолчанию |
| status        | _danger_ | Статус по умолчанию |
| alertClass    | _пусто_  | Дополнительные класс для блока алерта |
