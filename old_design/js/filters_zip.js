'use strict';

//=====================================================================================================
//  Подготовка фильтров каталога товаров:
//=====================================================================================================

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

// Подготовка к сортировке и сортировка подкатегорий по алфавиту:

// for (var k in catsubs) {
//   for(var kk in catsubs[k]) {
//     catsubs[k]['key' + kk] = catsubs[k][kk];
//     delete catsubs[k][kk];
//     catsubs[k] = sortObjByValue(catsubs[k]);
//   }
// }

// Данные, которые будут переданы для создания фильтров:

var dataFilters = [{
  title: 'Спецпредложение',
  isOpen: 'true',
  key: 'specialOffer',
  items: createFilterData(discounts)
  // items: specialOffer
}, {
  title: 'Категория',
  isOpen: 'true',
  key: 'cat',
  items: catsubs
  // items: sortObjByKey(catsubs)
}, {
  title: 'Бренд',
  isOpen: 'true',
  key: 'brand',
  items: brands
  // items: sortObjByKey(brands)
}];
