'use strict';

// Содержимое фильтров:

var mainCats = {
  'Одежда': 'odegda',
  'Обувь': 'obuv',
  'Шлемы': 'shlem',
  'Оптика': 'optic',
  'Снаряжение': 'snarag',
  'Защита': 'zashita',
  'Сумки и рюкзаки': 'sumruk'
};

var odegda = {};
var obuv = {};
var shlem = {};
var optic = {};
var snarag = {};
var zashita = {};
var sumruk = {};

function createCats() {
  for (var cat in cats) {
    if (cats[cat] == '43') {
      odegda[cat] = '1';
    }
    if (cats[cat] == '44') {
      obuv[cat] = '1';
    }
    if (cats[cat] == '48') {
      shlem[cat] = '1';
    }
    if (cats[cat] == '49') {
      optic[cat] = '1';
    }
    if (cats[cat] == '50') {
      snarag[cat] = '1';
    }
    if (cats[cat] == '51') {
      zashita[cat] = '1';
    }
    if (cats[cat] == '52') {
      sumruk[cat] = '1';
    }
  }
}

createCats();

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
  'Бирюзовый': 'turquoise', //не нашла такого ключа
  'Бордовый': 'bordo',
  'Голубой': 'blue', //не нашла такого ключа
  'Желтый': 'yellow',
  'Зеленый': 'green',
  'Камуфляж': 'camouflage', //не нашла такого ключа
  'Коричневый': 'brown',
  'Красный': 'red',
  'Мульти': 'multicolor',
  'Оранжевый': 'orange',
  'Прозрачный': 'transparent',
  'Розовый': 'pink',
  'Серый': 'grey',
  'Синий': 'blue', //не нашла такого ключа
  'Фиолетовый': 'fiol',
  'Фуксия': 'black/pink', //такой же как у черного/розового
  'Хаки': 'haki',
  'Черный': 'black',
  'Черный/розовый': 'black/pink',
  'Черный/серый': 'black/grey'
};

// Данные, которые будут переданы для создания фильтров:

var dataForFilters = [{
  title: 'Категория',
  isShow: true,
  key: 'mainCats',
  items: mainCats
// }, {
//   title: 'Одежда',
//   key: 'cat',
//   items: odegda
// },{
//   title: 'Обувь',
//   key: 'cat',
//   items: obuv
// }, {
//   title: 'Шлемы',
//   key: 'cat',
//   items: shlem
// }, {
//   title: 'Оптика',
//   key: 'cat',
//   items: optic
// }, {
//   title: 'Снаряжение',
//   key: 'cat',
//   items: snarag
// }, {
//   title: 'Защита',
//   key: 'cat',
//   items: zashita
// }, {
//   title: 'Сумки и рюкзаки',
//   key: 'cat',
//   items: sumruk
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

// Изменение исходных данных карточек товаров:

items.forEach((item, index) => {
  item.numb = index;
  item.images = item.images.toString().split(';');
  // item.free_qty = 0;
});

// var items = [items[0], items[1], items[2],items[3],items[4],items[5],items[6],items[7],items[8],items[9]];