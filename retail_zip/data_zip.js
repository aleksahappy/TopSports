'use strict';

// Содержимое фильтров:

var specialOffer = {
  'is_new': 'Новинка',
  'sale': 'Распродажа'
};

var colors = {
  "white": 'Белый',
  "black": 'Черный',
  "red": 'Красный',
  "yellow": 'Желтый',
  "grey": 'Серый',
  "orange": 'Оранжевый',
  "blue": 'Синий', // нет в массиве
  // "metallic": 'Металик', // нет в массиве
  // "graphite": 'Графитовый' // нет в массиве
};

// Данные, которые будут переданы для создания фильтров:

var dataForFilters = [{
  title: 'Спецпредложение',
  isShow: true,
  key: 'specialOffer',
  items: specialOffer
}, {
  title: 'Категория',
  isShow: true,
  key: 'cat',
  items: catsubs
}, {
  title: 'Бренд',
  key: 'brand',
  items: brands
}, {
  title: 'Цвет',
  key: 'color',
  items: colors
}];
