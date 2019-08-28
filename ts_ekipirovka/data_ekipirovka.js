'use strict';

// Преобразование исходных данных:

items.forEach((item, index) => {
  item.images = item.images.toString().split(';');
});

var odegda = {};
var obuv = {};
var shlem = {};
var optic = {};
var snarag = {};
var zashita = {};
var sumruk = {};

var catId = {
  43: 'odegda',
  44: 'obuv',
  48: 'shlem',
  49: 'optic',
  50: 'snarag',
  51: 'zashita',
  52: 'sumruk'
};

function createCats() {
  for (var k in )

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
  // 'Бирюзовый': 'turquoise', // нет в массиве
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
  'Синий': 'blue', // нет в массиве
  'Фиолетовый': 'fiol',
  // 'Фуксия': 'fuxy',
  'Хаки': 'haki',
  'Черный': 'black',
  // 'Черный/розовый': 'black/pink',
  // 'Черный/серый': 'black/grey'
};

// Данные, которые будут переданы для создания фильтров:

var filtersEkipirovka = [{
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

var filtersOdegda = 
var dataForFilters = ;
