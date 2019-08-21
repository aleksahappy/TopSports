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

var use = {
  'Мотоцикл': 'moto',
  'Квадроцикл': 'quadro',
  'Велосипед': 'velo',
  'Скейтборд': 'skatebord',
  'Снегоход': 'sneghod',
  'Сноубайк': 'snegbike',
  'Сноуборд': 'snegbord',
  'Горные лыжи': 'gornie',
  'Фитнесс': 'fitness'
};

var ages = {
  'Взрослые':'adult',
  'Дети': 'child'
};

var gender = {
  'Муж.':'male',
  'Жен.':'female'
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
  'Белый': 'white',
  'Черный': 'black',
  'Металик': '',
  'Красный': '',
  'Синий': '',
  'Графитовый': '',
  'Желтый': '',
  'Серый': '',
  'Оранжевый': ''
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
