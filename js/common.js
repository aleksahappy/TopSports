var discounts = [{
  did: '1',
  dtitle: '+ Подарок',
  ddesc: '10шт. + подарок',
  ddatestart: '01.11.2019',
  ddateend: '30.11.2019',
  dtype: 'numplusart',
  dnv: 10,
  dnvex: 1,
  diart: [3524],
  diartex: '3852',
  dartprice: 0,
  dartexprice: 0,
  dcondition: 0,
  dconditionex: 0
}, {
  did: '2',
  dtitle: '1 бесплатно',
  ddesc: '6 покупаешь 1 бесплатно',
  ddatestart: '01.11.2019',
  ddateend: '30.11.2019',
  dtype: 'numplusnum',
  dnv: 6,
  dnvex: 1,
  diart: [29760],
  diartex: '',
  dartprice: 0,
  dartexprice: 0,
  dcondition: 0,
  dconditionex: 0
}, {
  did: '3',
  dtitle: 'Скидка от РРЦ',
  ddesc: 'кратно 20шт. - скидка от РРЦ',
  ddatestart: '01.11.2019',
  ddateend: '30.11.2019',
  dtype: 'numminusproc',
  dnv: 20,
  dnvex: 55,
  diart: [3818],
  diartex: '',
  dartprice: 0,
  dartexprice: 0,
  dcondition: 0,
  dconditionex: 0
}, {
  did: '3',
  dtitle: 'Скидка от РРЦ',
  ddesc: 'кратно 25шт. - скидка от РРЦ',
  ddatestart: '01.11.2019',
  ddateend: '30.11.2019',
  dtype: 'numminusproc',
  dnv: 25,
  dnvex: 55,
  diart: [3813],
  diartex: '',
  dartprice: 0,
  dartexprice: 0,
  dcondition: 0,
  dconditionex: 0
}, {
  did: '4',
  dtitle: 0,
  ddesc: 0,
  ddatestart: '01.11.2019',
  ddateend: '30.11.2019',
  dtype: 'sumlessproc',
  dnv: [0, 200000, 500000],
  dnvex: [25, 27, 30],
  diart: 0,
  diartex: 0,
  dartprice: 0,
  dartexprice: 0,
  dcondition: {razdel: 'lodki'},
  dconditionex: 0
}];

'use strict';

setPaddingToBody();

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Константы:

var website =  document.body.dataset.website,
    pageId = document.body.id,
    headerCart = document.getElementById('header-cart'),
    btnGoTop = document.getElementById('btn-go-top');

// Динамически изменяемые переменные:

var pageUrl,
    sectionId,
    pageInfo,
    list,
    subList,
    template,
    subTemplate,
    newItem,
    newSubItem,
    curEl,
    value,
    subkey,
    qty,
    scrolled;

// Переменные для циклов:

var isFound,
    isExsist,
    item,
    key,
    k,
    kk,
    kkk,
    i,
    ii,
    iii;

//=====================================================================================================
// Полифиллы:
//=====================================================================================================

(function() {
  // проверяем поддержку
  if (!Element.prototype.closest) {
    // реализуем
    Element.prototype.closest = function(css) {
      var node = this;
      while (node) {
        if (node.matches(css)) return node;
        else node = node.parentElement;
      }
      return null;
    };
  }
})();

//=====================================================================================================
// Сортировка объекта по алфавиту:
//=====================================================================================================

var sortedObj;

// Сортировка по ключу:

function sortObjByKey(obj) {
  sortedObj = {};
  Object.keys(obj).sort().forEach(key => sortedObj[key] = obj[key]);
  return sortedObj;
}

// Сортировка по значению:

function sortObjByValue(obj) {
  sortedObj = {};
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

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Установка отступов документа:

window.addEventListener('resize', setPaddingToBody);

var headerHeight,
    footerHeight;

function setPaddingToBody() {
  headerHeight = document.querySelector('.header').clientHeight;
  footerHeight = document.querySelector('.footer').clientHeight;
  document.body.style.paddingTop = `${headerHeight}px`;
  document.body.style.paddingBottom = `${footerHeight + 20}px`;
}

// Отображение/скрытие кнопки возвращения наверх страницы:

window.addEventListener('scroll', toggleBtnGoTop);

var coords;

function toggleBtnGoTop() {
  scrolled = window.pageYOffset;
  coords = window.innerHeight / 2;

  if (scrolled > coords) {
    btnGoTop.classList.add('show');
  }
  if (scrolled < coords) {
    btnGoTop.classList.remove('show');
  }
}

// Вернуться наверх страницы:

btnGoTop.addEventListener('click', goToTop);

function goToTop() {
  scrolled = window.pageYOffset;
  if (scrolled > 0 && scrolled < 50000) {
    window.scrollBy(0, -(scrolled/5));
    setTimeout(goToTop, 0);
  } else if (scrolled >= 50000) {
    window.scrollTo(0,0);
  }
}

// Получение текущей прокрутки документа:

var scrollTop;

function getDocumentScroll() {
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
}

// Установка прокрутки документа:

function setDocumentScroll(top) {
  document.documentElement.scrollTop = top;
  document.body.scrollTop = top;
}

// Добавление всплывающих подсказок:

var elements;

function addTooltips(key) {
  elements = document.querySelectorAll(`[data-key=${key}]`);
  elements.forEach(el => {
    el.setAttribute('tooltip', el.textContent.trim());
  });
}

// Функция преобразования цены к формату с пробелами:

function convertPrice(price) {
  return (price + '').replace(/(\d{1,3})(?=((\d{3})*)$)/g, " $1");
}

// Функция преобразования строки с годами к укороченному формату:

var years,
    curYear,
    nextYear,
    prevYear,
    resultYears;

function convertYears(stringYears) {
  years = stringYears.split(',');
  resultYears = [];

  for (i = 0; i < years.length; i++) {
    curYear = parseInt(years[i].trim(), 10);
    nextYear = parseInt(years[i + 1], 10);
    prevYear = parseInt(years[i - 1], 10);

    if (curYear + 1 != nextYear) {
      if (i === years.length -  1) {
        resultYears.push(curYear);
      } else {
        resultYears.push(curYear + ', ');
      }
    } else if (curYear - 1 !== prevYear) {
      resultYears.push(curYear);
    } else if (curYear + 1 === nextYear && resultYears[resultYears.length - 1] !== ' &ndash; ') {
      resultYears.push(' &ndash; ');
    }
  }
  return resultYears = resultYears.join('');
}

//=====================================================================================================
// Сохранение и извлечение данных на компьютере пользователя:
//=====================================================================================================

// Проверка доступности storage:

var storage,
    test;

function storageAvailable(type) {
	try {
		storage = window[type];
    test = '__storage_test__';
		storage.setItem(test, test);
		storage.removeItem(test);
		return true;
	}
	catch(error) {
		return false;
	}
}

// Сохранение данныx в storage или cookie:

function saveInLocal(key, data) {
  var stringData = JSON.stringify(data);
  if (storageAvailable('localStorage')) {
    localStorage[key] = stringData;
  }
  else {
    if (getCookie(key)) {
      deleteCookie(key);
    }
    setCookie(key, stringData, {expires: getDateExpires(30)});
  }
}

// Получение данных из storage или cookie:

function getFromLocal(key) {
  if (storageAvailable('localStorage')) {
    if (localStorage[key]) {
      return JSON.parse(localStorage[key]);
    } else {
      return undefined;
    }
  }
  else {
    if (getCookie(key)) {
      return JSON.parse(getCookie(key));
    } else {
      return undefined;
    }
  }
}

// Сохранение данных в cookie:

function setCookie(key, value, options) {
  options = options || {};
  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var date = new Date();
    date.setTime(date.getTime() + expires * 1000);
    expires = options.expires = date;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);
  var updatedCookie = key + '=' + value;

  for (key in options) {
    updatedCookie += "; " + key;
    var propValue = options[key];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }
  document.cookie = updatedCookie;
}

// Функция для установки срока хранения cookie:

function getDateExpires(days) {
  var date = new Date;
  date.setDate(date.getDate() + days);
  return date;
}

// Получение данных из cookie:

function getCookie(key) {
  var matches = document.cookie.match(new RegExp(
    '(?:^|; )' + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Удаление данных из cookie:

function deleteCookie(key) {
  setCookie(key, '', {expires: -1});
}

// Получение данных о странице по ключу:

function getInfo(key) {
  pageInfo = getFromLocal(website) ? getFromLocal(website) : {};
  if (!pageInfo[key]) {
    pageInfo[key] = {};
  }
  return pageInfo[key];
}

// Сохранение данных о странице по ключу:

function saveInfo(key, data) {
  pageInfo = getFromLocal(website) ? getFromLocal(website) : {};
  if (!pageInfo[key]) {
    pageInfo[key] = {};
  }
  pageInfo[key] = data;
  saveInLocal(website, pageInfo);
}

// Удаление всех данных о странице по ключу:

function removeInfo(key, data) {
  pageInfo = getFromLocal(website) ? getFromLocal(website) : {};
  if (!pageInfo[key]) {
    pageInfo[key] = {};
  }
  pageInfo[key] = data;
  saveInLocal(website, pageInfo);
}
