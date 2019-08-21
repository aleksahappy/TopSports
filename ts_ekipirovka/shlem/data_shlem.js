'use strict';

// Преобразование исходных данных:

items.forEach((item, index) => {
  item.images = item.images.toString().split(';');
});

var sortedItems = items;
sortedItems = sortedItems.filter(item => item.shlem == 1);

// Содержимое фильтров:

var specialOffer = {
  'Новинка': 'is_new',
  'Распродажа': 'sale'
};

var shlem = {};
for (var cat in cats) {
  if (cats[cat] == '48') {
    shlem[cat] = '1';
  }
}

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

var colors = {
  'Белый': 'white',
  // 'Бирюзовый': 'turquoise', //не нашла такого ключа
  // 'Бордовый': 'bordo',
  'Голубой': 'cyan',
  'Желтый': 'yellow',
  'Зеленый': 'green',
  // 'Камуфляж': 'camo',
  'Коричневый': 'brown',
  'Красный': 'red',
  'Мульти': 'multicolor',
  'Оранжевый': 'orange',
  'Прозрачный': 'transparent',
  'Розовый': 'pink',
  'Серый': 'grey',
  'Синий': 'blue', //не нашла такого ключа
  'Фиолетовый': 'fiol',
  // 'Фуксия': 'fuxy',
  'Хаки': 'haki',
  'Черный': 'black',
  // 'Черный/розовый': 'black/pink',
  // 'Черный/серый': 'black/grey'
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
  items: shlem
}, {
  title: 'Бренд',
  key: 'brand',
  items: brands
}, {
  title: 'Применяемость',
  key: 'use',
  items: use
}, {
  title: 'Размер',
  key: 'size',
  items: sizes
}, {
  title: 'Возраст',
  key: 'age',
  items: ages
}, {
  title: 'Пол',
  key: 'gender',
  items: gender
}, {
  title: 'Цвет',
  key: 'color',
  items: colors
}];
