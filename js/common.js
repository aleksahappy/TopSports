'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Константы:

var website =  document.body.dataset.website,
    pageId = document.body.id,
    isCart = document.getElementById('cart');

// Динамически изменяемые переменные:

var pageInfo;

// Переменные для циклов:

var isExsist,
    item,
    key,
    k,
    kk,
    kkk,
    i;

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

// Добавление всплывающих подсказок:

function addTooltips(key) {
  var elements = document.querySelectorAll(`[data-key=${key}]`);
  elements.forEach(el => {
    var tooltipText = el.textContent.trim();
    el.setAttribute('tooltip', tooltipText);
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
      if (i == years.length -  1) {
        resultYears.push(curYear);
      } else {
        resultYears.push(curYear + ', ');
      }
    } else if (curYear - 1 != prevYear) {
      resultYears.push(curYear);
    } else if (curYear + 1 == nextYear && resultYears[resultYears.length - 1] != ' &ndash; ') {
      resultYears.push(' &ndash; ');
    }
  }
  return resultYears = resultYears.join('');
}

// Получение текущей прокрутки документа:

var scrollTop;

function getDocumentScroll() {
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
}

// Установка прокрутки документа:

function setDocumentScroll() {
  document.documentElement.scrollTop = scrollTop;
  document.body.scrollTop = scrollTop;
}

//=====================================================================================================
// Сохранение и извлечение данных на компьютере пользователя:
//=====================================================================================================

// Проверка доступности storage:

function storageAvailable(type) {
	try {
		var storage = window[type],
        x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
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
