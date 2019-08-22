'use strict';

// Преобразование исходных данных:

items.forEach((item, index) => {
  item.images = item.images.toString().split(';');
});

var sortedItems = items;

// Содержимое фильтров:

var specialOffer = {
  'Новинка': 'is_new',
  'Распродажа': 'sale'
};

for (var cat in cats) {
  var key = cats[cat];
  delete cats[cat];
  cats[key] = 1;
}

var colors = {
  "Белый": 'white',
  "Черный": 'black',
  "Красный": 'red',
  "Желтый": 'yellow',
  "Серый": 'grey',
  "Оранжевый": 'orange',
  "Синий": 'blue', // нет в массиве
  // "Металик": 'metallic', // нет в массиве
  // "Графитовый": 'graphite' // нет в массиве
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
  items: cats
}, {
  title: 'Бренд',
  key: 'brand',
  items: brands
}, {
  title: 'Цвет',
  key: 'color',
  items: colors
}];
