'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Константы:

var url = 'http://80.234.34.212:2000/-aleksa-/TopSports/test/',
    website = document.body.dataset.website,
    pageId = document.body.id,
    headerCart = document.getElementById('header-cart'),
    pageLoader = document.getElementById('page-loader'),
    errorContainer = document.getElementById('error-container'),
    error = document.getElementById('error'),
    upBtn = document.getElementById('up-btn');

// Динамически изменяемые переменные:

if (headerCart) {
  var cart = {},
      cartId;
}

// Переменные для циклов:

var isSearch,
    isFound,
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
// При запуске страницы:
//=====================================================================================================

  setPaddingToBody();

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
// Создание данных для фильтров каталога:
//=====================================================================================================

// Создание фильтра каталога из данных options или discounts:

function createFilterData(curArray, optNumb) {
  var filter = {},
      name;
  curArray.forEach(item => {
    if (item.options && item.options != 0) {
      name = item.options[optNumb];
    }
    if (item.dtitle) {
      name = item.dtitle;
    }
    if (name != undefined && filter[name] == undefined) {
      filter[name] = 1;
    }
  });
  if (curArray === discounts) {
    filter.is_new = 'Новинка';
    filter.sale = 'Распродажа';
  }
  return filter;
}

//=====================================================================================================
// Запросы на сервер:
//=====================================================================================================

// Отправка запросов на сервер:

// type : 'multipart/form-data', 'application/json; charset=utf-8'
function sendRequest(url, data, type = 'application/json; charset=utf-8') {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.addEventListener('error', () => reject(new Error("Network Error")));
    request.addEventListener('load', () => {
      if (request.status !== 200) {
        var error = new Error(this.statusText);
        error.code = this.status;
        reject(error);
      }
      resolve(request.responseText);
    });
    if (data) {
      request.open('POST', url);
      request.setRequestHeader('Content-type', type);
    } else {
      request.open('GET', url);
    }
    request.send();
  });
}

// Получение данных корзины:

function getCartInfo() {
  return new Promise((resolve, reject) => {
    sendRequest(url + 'cart.txt')
    .then(
      result => {
        if (JSON.stringify(cart) === result) {
          console.log(cart);
          reject();
        } else {
          cart = JSON.parse(result);
          console.log(cart);
          resolve();
        }
      }
    )
    .catch(error => {
      console.log(error);
      reject();
    })
  });
}

//=====================================================================================================
// Сортировка объектов по алфавиту:
//=====================================================================================================

// Сортировка по ключу:

function sortObjByKey(obj) {
  var sortedObj = {};
  Object.keys(obj).sort().forEach(key => sortedObj[key] = obj[key]);
  return sortedObj;
}

// Сортировка только по численной части ключа:

function sortObjByNumericKey(obj) {
  var sortedObj = {};
  Object.keys(obj).sort((a,b) => {
    if (parseInt(a, 10) < parseInt(b, 10)) {
      return -1;
    }
    if (parseInt(a, 10) > parseInt(b, 10)) {
      return 1;
    }
    return 0;
  }).forEach(key => sortedObj[key] = obj[key]);
  return sortedObj;
}

// Сортировка по значению:

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

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Установка отступов документа:

window.addEventListener('resize', setPaddingToBody);

function setPaddingToBody() {
  var headerHeight = document.querySelector('.header').clientHeight;
  var footerHeight = document.querySelector('.footer').clientHeight;
  document.body.style.paddingTop = `${headerHeight}px`;
  document.body.style.paddingBottom = `${footerHeight + 20}px`;
}

// Удаление значения из инпута при его фокусе:

function onFocusInput(input) {
  if (input.value != '') {
    input.value = '';
  }
}

// Возвращение значения в инпут при потере им фокуса:

function onBlurInput(input) {
  input.value = input.dataset.value;
}

// Запрет на ввод в инпут любого значения кроме цифр:

function checkValue(event) {
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  var chr = getChar(event);
  if (chr == null) return;
  if (chr < '0' || chr > '9') {
    return false;
  }
}

// Кросс-браузерная функция для получения символа из события keypress:

function getChar(event) {
  if (event.which == null) { // IE
    if (event.keyCode < 32) return null; // спец. символ
    return String.fromCharCode(event.keyCode)
  }
  if (event.which != 0 && event.charCode != 0) { // все кроме IE
    if (event.which < 32) return null; // спец. символ
    return String.fromCharCode(event.which); // остальные
  }
  return null; // спец. символ
}

// Отображение/скрытие кнопки возвращения наверх страницы:

if (upBtn) {
  window.addEventListener('scroll', toggleBtnGoTop);
}

function toggleBtnGoTop() {
  var scrolled = window.pageYOffset;
  var coords = window.innerHeight / 2;

  if (scrolled > coords) {
    upBtn.classList.add('show');
  }
  if (scrolled < coords) {
    upBtn.classList.remove('show');
  }
}

// Вернуться наверх страницы:

function goToTop() {
  var scrolled = window.pageYOffset;
  if (scrolled > 0 && scrolled <= 5000) {
    window.scrollBy(0, -80);
    setTimeout(goToTop, 0);
  } else if (scrolled > 5000) {
    window.scrollTo(0, 5000);
    goToTop();
  }
}

// Показ сообщения об ошибке:

function showError(text) {
  getDocumentScroll();
  document.body.classList.add('no-scroll');
  error.textContent = text;
  errorContainer.display = 'flex';
}

// Скрытие сообщения об ошибке:

function closeError() {
  errorContainer.style.display = 'none';
  document.body.classList.remove('no-scroll');
  setDocumentScroll();
}

// Получение текущей прокрутки документа:

var scrollTop;

function getDocumentScroll() {
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
}

// Установка прокрутки документа:

function setDocumentScroll(top = scrollTop) {
  document.documentElement.scrollTop = top;
  document.body.scrollTop = top;
}

// Добавление всплывающих подсказок:

function addTooltips(key) {
  var elements = document.querySelectorAll(`[data-key=${key}]`);
  if (elements) {
    elements.forEach(el => {
      el.setAttribute('tooltip', el.textContent.trim());
    });
  }
}

// Функция преобразования цены к формату с пробелами:

function convertPrice(price) {
  return (price + '').replace(/(\d{1,3})(?=((\d{3})*)$)/g, " $1");
}

// Функция преобразования строки с годами к укороченному формату:

function convertYears(stringYears) {
  var years = stringYears.split(',');
  var resultYears = [];
  var curYear, nextYear, prevYear;

  if (years.length <= 2) {
    return stringYears.replace(/\,/gi, ', ');
  }

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

// Проверка актуальности даты в периоде:

function checkDate(start, end) {
  var curDate = new Date(),
      dateStart = start.split('.'),
      dateEnd = end.split('.');
  dateStart = new Date(dateStart[2], dateStart[1] - 1, dateStart[0], 0, 0, 0, 0);
  dateEnd = new Date(dateEnd[2], dateEnd[1] - 1, dateEnd[0], 23, 59, 59, 999);
  if (curDate > dateStart && curDate < dateEnd) {
    return true;
  } else {
    return false;
  }
}

//=====================================================================================================
// Сохранение и извлечение данных на компьютере пользователя:
//=====================================================================================================

// Проверка доступности storage:

function storageAvailable(type) {
  var storage, test;
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
  var pageInfo = getFromLocal(website) ? getFromLocal(website) : {};
  if (!pageInfo[key]) {
    pageInfo[key] = {};
  }
  return pageInfo[key];
}

// Сохранение данных о странице по ключу:

function saveInfo(key, data) {
  var pageInfo = getFromLocal(website) ? getFromLocal(website) : {};
  if (!pageInfo[key]) {
    pageInfo[key] = {};
  }
  pageInfo[key] = data;
  saveInLocal(website, pageInfo);
}

// Удаление всех данных о странице по ключу:

function removeInfo(key, data) {
  var pageInfo = getFromLocal(website) ? getFromLocal(website) : {};
  if (!pageInfo[key]) {
    pageInfo[key] = {};
  }
  pageInfo[key] = data;
  saveInLocal(website, pageInfo);
}
