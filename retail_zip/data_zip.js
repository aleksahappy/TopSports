'use strict';

// Содержимое фильтров:

var specialOffer = {
  'is_new': 'Новинка',
  'sale': 'Распродажа'
};

var colors = {
  'white': 'Белый',
  'black': 'Черный',
  'grey': 'Серый',
  'blue': 'Синий', // нет в массиве
  'red': 'Красный',
  'yellow': 'Желтый',
  'orange': 'Оранжевый',
  'metallic': 'Металик', // нет в массиве
  'graphite': 'Графитовый' // нет в массиве
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
