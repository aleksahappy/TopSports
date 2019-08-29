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
  // 'turquoise': 'Бирюзовый', // нет в массиве
  // 'bordo': 'Бордовый',
  'cyan': 'Голубой',
  'yellow': 'Желтый',
  'green': 'Зеленый',
  // 'camo': 'Камуфляж',
  'brown': 'Коричневый',
  'red': 'Красный',
  'multicolor': 'Мульти',
  'orange': 'Оранжевый',
  'transparent': 'Прозрачный',
  'pink': 'Розовый',
  'grey': 'Серый',
  'blue': 'Синий', // нет в массиве
  'fiol': 'Фиолетовый',
  // 'fuxy': 'Фуксия',
  'haki': 'Хаки',
  'black': 'Черный',
  // 'black/pink': 'Черный/розовый',
  // 'black/grey': 'Черный/серый'
};

// Данные, которые будут переданы для создания фильтров:

var dataForFilters = [{
  title: 'Спецпредложение',
  isShow: true,
  key: 'specialOffer',
  items: specialOffer
}, {
  title: 'Бренд',
  key: 'brand',
  items: brands
}, {
  title: 'Применяемость',
  key: 'use',
  items: use
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
