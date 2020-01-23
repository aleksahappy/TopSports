'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Константы:

var url = 'http://80.234.34.212:2000/-aleksa-/TopSports/test/',
    website = document.body.dataset.website,
    pageId = document.body.id,
    headerCart = document.getElementById('header-cart'),
    loader = document.getElementById('loader'),
    errorContainer = document.getElementById('error-container'),
    alertsContainer = document.getElementById('alerts-container'),
    upBtn = document.getElementById('up-btn');

// Динамически изменяемые переменные:

if (headerCart) {
  var cartId,
      cart = {},
      cartChanges = {},
      isSearch;
}

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
        if (node.matches(css)) {
          return node;
        } else {
          node = node.parentElement;
        }
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
          // console.log(cart);
          reject();
        } else {
          cart = JSON.parse(result);
          // console.log(cart);
          resolve();
        }
      }
    )
    .catch(error => {
      // console.log(error);
      reject();
    })
  });
}

// Получение данных о конкретном товаре:

function getProductInfo(id) {
  return new Promise((resolve, reject) => {
    sendRequest(`http://80.234.34.212:2000/-aleksa-/TopSports/test/product${id}.txt`)
    .then(
      result => {
        var product = JSON.parse(result);
        // console.log(product);
        resolve(product);
      }
    )
    .catch(error => {
      // console.log(error);
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

  for (let key in options) {
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

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Вставка заглушки при ошибке загрузки изображения:

function replaceImg(img) {
  img.src = '../img/no_img.jpg';
}

// Показ элемента:

function showElement(el, style = 'block') {
  el.style.display = style;
}

// Скрытие элемента:

function hideElement(el) {
  el.style.display = 'none';
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

// Открытие всплывающего окна:

function openPopUp(el, style = 'block') {
  getDocumentScroll();
  document.body.classList.add('no-scroll');
  showElement(el, style);
}

// Закрытие всплывающего окна:

function closePopUp(el, style = 'none') {
  hideElement(el, style);
  document.body.classList.remove('no-scroll');
  setDocumentScroll();
}

// Показ сообщения об ошибке:

function showError(text) {
  if (!text) {
    return;
  }
  document.getElementById('error').textContent = text;
  openPopUp(errorContainer, 'flex');
}

// Скрытие сообщения об ошибке:

function closeError() {
  closePopUp(errorContainer);
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
  if (event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }
  var chr = getChar(event);
  if (chr == null) {
    return;
  }
  if (chr < '0' || chr > '9') {
    return false;
  }
}

// Кросс-браузерная функция для получения символа из события keypress:

function getChar(event) {
  if (event.which == null) { // IE
    if (event.keyCode < 32) {
      return null; // спец. символ
    }
    return String.fromCharCode(event.keyCode);
  }
  if (event.which != 0 && event.charCode != 0) { // все кроме IE
    if (event.which < 32) {
      return null; // спец. символ
    }
    return String.fromCharCode(event.which); // остальные
  }
  return null; // спец. символ
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

  for (let i = 0; i < years.length; i++) {
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
// Работа кнопки "Наверх страницы":
//=====================================================================================================

// Отображение/скрытие кнопки "Наверх страницы":

if (upBtn) {
  window.addEventListener('scroll', toggleBtnGoTop);
}

function toggleBtnGoTop() {
  var scrolled = window.pageYOffset,
      coords = window.innerHeight / 2;

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

//=====================================================================================================
// Работа выпадающих списков:
//=====================================================================================================

document.querySelectorAll('.activate.select').forEach(el => new DropDown(el));
document.querySelectorAll('.activate.checkbox').forEach(el => new DropDown(el));
document.addEventListener('click', (event) => {
  if (!event.target.closest('.activate')) {
    document.querySelectorAll('.activate.open').forEach(el => el.classList.remove('open'));
  }
});

function DropDown(obj) {
  // Элементы для работы:
  this.filter = obj;
  this.head = obj.querySelector('.head');
  this.title = obj.querySelector('.title');
  this.items = obj.querySelectorAll('.item');
  this.closeBtn = obj.querySelector('.close-btn');

  // Константы:
  this.titleText = this.title.textContent;

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (this.head) {
      this.head.addEventListener('click', event => this.toggleFilter(event));
    }
    this.items.forEach(el => el.addEventListener('click', event => this.checkItem(event)));
    // this.closeBtn.addEventListener('click', event => this.clearFilter(event));
  }
  this.setEventListeners();

  // Открытие/закрытие выпадающего списка:
  this.toggleFilter = function() {
    if (this.filter.classList.contains('open')) {
      this.filter.classList.remove('open');
    } else {
      document.querySelectorAll('.activate.open').forEach(el => el.classList.remove('open'));
      this.filter.classList.add('open');
    }
  }

  // Выбор значения:
  this.checkItem = function (event) {
    var curItem = event.currentTarget;
    if (this.filter.classList.contains('select')) {
      curItem.classList.add('checked');
    }
    if (this.filter.classList.contains('checkbox')) {
      curItem.classList.toggle('checked');
    }

    var checked = this.filter.querySelectorAll('.item.checked');
    if (checked.length === 0) {
      this.clearFilter(event);
    } else {
      if (this.filter.classList.contains('select')) {
        this.title.textContent = curItem.textContent;
        this.filter.dataset.value = curItem.dataset.value;
        this.filter.classList.remove('open');
      }
      if (this.filter.classList.contains('checkbox')) {
        this.title.textContent = 'Выбрано значений: ' + checked.length;
        var value = [];
        checked.forEach(el => value.push(el.dataset.value));
        this.filter.dataset.value = value;
      }
    }
    var event = new Event("onchange");
    this.filter.dispatchEvent(event);
  }

  // Очистка фильтра:
  this.clearFilter = function () {
    this.title.textContent = this.titleText;
    this.filter.querySelectorAll('.item.checked').forEach(el => el.classList.remove('checked'));
  }
}

//=====================================================================================================
// Работа с окном уведомлений:
//=====================================================================================================

// Открытие окна уведомлений:

function showMessages() {
  openPopUp(alertsContainer, 'flex');
}

// Закрытие окна уведомлений:

function closeMessages(event) {
  if (event.target.closest('.alerts.pop-up')) {
    return;
  }
  closePopUp(alertsContainer);
}

//=====================================================================================================
// Работа с таблицами:
//=====================================================================================================

// Выравнивание столбцов таблицы при загрузке:

document.addEventListener('DOMContentLoaded', () => {
  var table = document.querySelector('.table-wrap');
  if (table) {
    setTimeout(() => alignTableColumns(table), 10);
  }
});

function alignTableColumns(table) {
  var headCells = table.querySelectorAll('.table-head th');
  headCells.forEach(headCell => {
    var bodyCell = table.querySelector(`.table-body > tr:first-child > td:nth-child(${headCell.id})`),
        headCellWidth = headCell.offsetWidth,
        bodyCellWidth = bodyCell.offsetWidth;
    if (headCellWidth > bodyCellWidth) {
      headCell.style.width = headCellWidth + 'px';
      headCell.style.minWidth = headCellWidth + 'px';
      headCell.style.maxWidth = headCellWidth + 'px';
      bodyCell.style.width = headCellWidth + 'px';
      bodyCell.style.minWidth = headCellWidth + 'px';
      bodyCell.style.maxWidth = headCellWidth + 'px';
    }
    if (headCellWidth < bodyCellWidth) {
      headCell.style.width = bodyCellWidth + 'px';
      headCell.style.minWidth = bodyCellWidth + 'px';
      headCell.style.maxWidth = bodyCellWidth + 'px';
      bodyCell.style.width = bodyCellWidth + 'px';
      bodyCell.style.minWidth = bodyCellWidth + 'px';
      bodyCell.style.maxWidth = bodyCellWidth + 'px';
    }
  });
}

// Изменение ширины столбоцов таблицы пользователем:

(function () {
  var curColumn = null,
      startOffset;

  var resizeBtns = document.querySelectorAll('.resize-btn');

  if (resizeBtns.length > 0) {
    resizeBtns.forEach(el => {
      el.addEventListener('mousedown', (event) => {
        curColumn = event.currentTarget.parentElement;
        startOffset = curColumn.offsetWidth - event.pageX;
      });
    });

    document.addEventListener('mousemove', (event) => {
      if (curColumn) {
        var newWidth = startOffset + event.pageX + 'px',
            curTable = curColumn.closest('.table-wrap');
        curColumn.style.width = newWidth;
        curColumn.style.minWidth = newWidth;
        curColumn.style.maxWidth = newWidth;
        curTable.querySelectorAll(`.table-body td:nth-child(${curColumn.id})`).forEach(el => {
          el.style.width = newWidth;
          el.style.minWidth = newWidth;
          el.style.maxWidth = newWidth;
        });
      }
    });

    document.addEventListener('mouseup', () => {
      curColumn = null;
    });
  }
})();

function onFocusSearch(form) {
  form.classList.add('onfocus');
}

function onBlurSearch(form) {
  event.preventDefault();
  setTimeout(() => {
    form.classList.remove('onfocus');
  }, 100);
}

//=====================================================================================================
// Заполенение контента по шаблону:
//=====================================================================================================

// Получение свойств "#...#" из шаблонов HTML:

function extractProps(template) {
  return template.match(/#[^#]+#/gi).map(prop => prop = prop.replace(/#/g, ''));
}

// Заполнение блока информацией по шаблону:

function createByTemplate(data, block, template) {
  var props = extractProps(template),
      list = '',
      newEl = template,
      value,
      propRegExp;
  data.forEach(el => {
    props.forEach(key => {
      propRegExp = new RegExp('#' + key + '#', 'gi');
      if (el[key] == undefined) {
        value = '';
      } else {
        value = el[key];
      }
      newEl = newEl.replace(propRegExp, value);
    });
    list += newEl;
  });
  block.insertAdjacentHTML('beforeend', list);
}
