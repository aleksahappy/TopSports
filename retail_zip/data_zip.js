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

// Сортировка данных фильтров по алфавиту:

function sortObjByKey(obj) {
  var sortedObj = {};
  Object.keys(obj).sort().forEach(key => sortedObj[key] = obj[key]);
  return sortedObj;
}

function sortObjByValue(obj) {
  var sortedObj = {};
  Object.keys(obj).sort((a,b) => {
    if (obj[a] < obj[b]) {
      return -1;
    }
    if (obj[a] > obj[b]) {
      return 1;
    }
    return 0;
  }).forEach(key => sortedObj[key] = obj[key]);
  return sortedObj;
}

// Подготовка к сортировке и сортировка подкатегорий по алфавиту:

for (var k in catsubs) {
  for(var kk in catsubs[k]) {
    catsubs[k]['key' + kk] = catsubs[k][kk];
    delete catsubs[k][kk];
    catsubs[k] = sortObjByValue(catsubs[k]);
  }
}

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
  items: sortObjByKey(catsubs)
}, {
  title: 'Бренд',
  isShow: true,
  key: 'brand',
  items: sortObjByKey(brands)
}];
