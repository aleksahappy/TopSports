'use strict';

// Содержимое фильтров:

var catId = {
  'odegda': 43,
  'obuv': 44,
  'shlem': 48,
  'optic': 49,
  'snarag': 50,
  'zashita': 51,
  'sumruk': 52
};

var specialOffer = {
  'is_new': 'Новинка',
  'sale': 'Распродажа'
};

var use = {
  'moto': 'Мотоцикл',
  'quadro': 'Квадроцикл',
  'velo': 'Велосипед',
  'skatebord': 'Скейтборд',
  'sneghod': 'Снегоход',
  'snegbike': 'Сноубайк',
  'snegbord': 'Сноуборд',
  'gornie': 'Горные лыжи',
  'fitness': 'Фитнесс'
};

var ages = {
  'adult':'Взрослые',
  'child': 'Дети'
};

var gender = {
  'male':'Муж.',
  'female':'Жен.'
};

var sizes = {
  '2XS': "1",
  'XS': "1",
  'S': "1",
  'M': "1",
  'L': "1",
  'XL': "1",
  '2XL': "1",
  '3XL': "1",
  '4XL': "1"
};

var colors = {
  'white': 'Белый',
  'black': 'Черный',
  'grey': 'Серый',
  'brown': 'Коричневый',
  'blue': 'Синий', // нет в массиве
  'cyan': 'Голубой',
  'turquoise': 'Бирюзовый', // нет в массиве
  'bordo': 'Бордовый',
  'red': 'Красный',
  'pink': 'Розовый',
  'fiol': 'Фиолетовый',
  'green': 'Зеленый',
  'fuxy': 'Фуксия',
  'orange': 'Оранжевый',
  'yellow': 'Желтый',
  'camo': 'Камуфляж',
  'haki': 'Хаки',
  'multicolor': 'Мульти',
  'transparent': 'Прозрачный',
  'black/pink': 'Черный/розовый',
  'black/grey': 'Черный/серый'
}

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
  // items: sortObjByKey(cats)
}, {
  title: 'Бренд',
  key: 'brand',
  items: brands
  // items: sortObjByKey(brands)
}, {
  title: 'Применяемость',
  key: 'use',
  items: use
  // items: sortObjByValue(use)
}, {
  title: 'Возраст',
  key: 'age',
  items: ages
}, {
  title: 'Пол',
  key: 'gender',
  items: gender
}, {
  title: 'Размер',
  key: 'size',
  items: sizes
}, {
  title: 'Цвет',
  key: 'color',
  items: colors
}];
// }, {
//   title: 'Емкость',
//   key: 'Емкость',
//   items: sortObjByKey(createFilterData(items, '1262'), 'number from string')
// }];


