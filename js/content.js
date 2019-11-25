'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var search = document.querySelector('.search'),
    searchInput = document.getElementById('search'),
    searchInfo = document.getElementById('search-info'),
    searchCount = document.getElementById('search-count'),
    clearSearchBtn = search.querySelector('.clear-search-btn'),
    mainMenuBtns = document.querySelector('.main-menu-btns'),
    submenu = document.querySelector('.submenu'),
    subsubmenu = document.querySelector('.subsubmenu'),
    zipUrl = document.getElementById('zip-url'),
    accUrl = document.getElementById('acc-url'),
    headerSelect = document.querySelector('.header-select'),
    mainHeader = document.querySelector('.main-header'),
    mainNav = document.getElementById('main-nav'),
    mainInfo = document.getElementById('main-info'),
    gallerySort = document.getElementById('gallery-sort'),
    content = document.getElementById('content'),
    filtersContainer = document.getElementById('filters-container'),
    filters = document.getElementById('filters'),
    menuFilters = document.getElementById('menu-filters'),
    gallery = document.getElementById('gallery'),
    manufTitle = document.getElementById('manuf-headers'),
    galleryNotice = document.getElementById('gallery-notice'),
    fullCardContainer = document.getElementById('full-card-container'),
    fullImgContainer = document.getElementById('full-img-container'),
    fullImg = document.getElementById('full-img'),
    pageLoader = document.getElementById('page-loader'),
    imgLoader = document.getElementById('img-loader');

// Получение шаблонов из HTML:

var mainNavTemplate = mainNav.innerHTML,
    navItemTemplate = mainNav.querySelector('.nav-item').outerHTML,
    filterTemplate = menuFilters.querySelector('.filter').outerHTML,
    filterItemTemplate = menuFilters.querySelector('.filter-item').outerHTML,
    filterSubitemTemplate = menuFilters.querySelector('.filter-item.subitem').outerHTML,
    minCardTemplate = document.getElementById('min-card-#object_id#'),
    bigCardTemplate = document.getElementById('big-card-#object_id#'),
    fullCardTemplate = document.getElementById('full-card-#object_id#'),
    fullImgTemplate = fullImg.innerHTML,
    carouselItemTemplate = fullImg.querySelector('.carousel-gallery').innerHTML;

// Получение свойств #...# из шаблонов HTML:


function extractProps(template) {
  return template.match(/#[^#]+#/gi).map(prop => prop = prop.replace(/#/g, ''));
}

// Динамически изменяемые переменные:

var view = content.classList.item(0),
    cardTemplate,
    curItems,
    dataForPageFilters,
    itemsForSearch,
    selecledCardList = '',
    searchedCardList = [],
    curItemsArray,
    filtersInfo,
    countItems = 0,
    countItemsTo = 0,
    pageUrl = pageId;

//=====================================================================================================
// // Преобразование исходных данных:
//=====================================================================================================

// Преобразование:
// - данных о картинках в карточке товара из строки в массив;
// - данных о годах в укороченный формат
// - добавление пробелов

items.forEach(item => {
  item.images = item.images.toString().split(';');
  if (item.options && item.options != 0) {
    for (key in item.options) {
      if (key == 32) {
        item.options[key] = convertYears(item.options[key]);
      } else {
        item.options[key] = item.options[key]
          .replace(/\,/gi, ', ')
          .replace(/\//gi, '/ ')
      }
    }
  }
});

// Сортировка товаров по категориям (чтобы не отражались на сайте вразноброс):

items.sort(dynamicSort(('catid')));

//=====================================================================================================
// Заполнение контента страницы:
//=====================================================================================================

// Первоначальное заполнение контента на странице:

document.addEventListener('DOMContentLoaded', () => pageLoader.style.display = 'none');
setCardTemplate();
initPage();

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Кастомные настройки каруселей:

// var bigCardCarousel = {
//   durationBtns: 600,
// };

var fullCardCarousel = {
  isNav: true,
  durationNav: 400,
  isLoupe: true
};

var fullImgCarousel = {
  durationNav: 400,
};

// Установка ширины галереи:

window.addEventListener('resize', setGalleryWidth);

function setGalleryWidth() {
  gallery.style.width = (content.clientWidth - filters.clientWidth - 30) + 'px';
}

// Установка ширины малых карточек товаров:

window.addEventListener('resize', setMinCardWidth);

var standartWidth,
    countCards,
    restGallery,
    changeMinCard,
    minCardWidth;

function setMinCardWidth() {
  if (content.classList.contains('list')) {
    return;
  }
  standartWidth = (13 * parseInt(getComputedStyle(gallery).fontSize, 10)),
  countCards = Math.floor(gallery.clientWidth / standartWidth),
  restGallery = gallery.clientWidth - countCards * standartWidth,
  changeMinCard = restGallery / countCards,
  minCardWidth = 0;
  if (changeMinCard <= 110) {
    minCardWidth = standartWidth + changeMinCard;
  } else {
    countCards = countCards + 1;
    minCardWidth = gallery.clientWidth / countCards;
  }
  document.querySelectorAll('.min-card').forEach(minCard => {
    minCard.style.width = minCardWidth + 'px';
  })
}

// Открытие и закрытие подменю на малых разрешениях:

function toggleSubmenu() {
  if (submenu.classList.contains('open')) {
    submenu.classList.remove('open');
  } else {
    submenu.classList.add('open');
    search.classList.remove('open');
  }
}

// Открытие и закрытие поиска на малых разрешениях:

function toggleSearch() {
  if (search.classList.contains('open')) {
    search.classList.remove('open');
  } else {
    search.classList.add('open');
    submenu.classList.remove('open');
  }
}

// Изменение позиционирования меню фильтров:

window.addEventListener('scroll', setFiltersPosition);
window.addEventListener('resize', setFiltersPosition);

var filtersPosition;

function setFiltersPosition() {
  if (window.innerWidth > 767) {
    filtersPosition = filters.style.position;
    if (filtersPosition == 'fixed') {
      if (menuFilters.clientHeight >= gallery.clientHeight) {
        filters.style.position = 'static';
        filters.style.top = '0px';
        filters.style.height = 'auto';
      } else {
        setFiltersHeight();
      }
    } else {
      if (menuFilters.clientHeight < gallery.clientHeight) {
        filters.style.position = 'fixed';
        setFiltersHeight();
      }
    }
  }
}

// Установка высоты меню фильтров:

var headerMainHeight,
    filtersHeight;

function setFiltersHeight() {
  scrolled = window.pageYOffset || document.documentElement.scrollTop;
  headerHeight = document.querySelector('.header').clientHeight;
  headerMainHeight = Math.max((document.querySelector('.main-header').clientHeight - scrolled), 20);
  footerHeight = Math.max((window.innerHeight + scrolled - document.querySelector('.footer').offsetTop) + 20, 0);
  filtersHeight = window.innerHeight - headerHeight - headerMainHeight - footerHeight;

  filters.style.top = `${headerHeight + headerMainHeight}px`;
  filters.style.height = `${filtersHeight}px`;
}

//=====================================================================================================
// Функции для работы с URL и данными страницы:
//=====================================================================================================

var path;

// Инициализация первой страницы при открытии сайта:

function initPage() {
  if (website == 'ts_r_zip' && !location.search) {
    window.history.pushState({'path': ['snegohod']},'', '?snegohod');
  }

  path = location.search.split('?').map(element => {
    if (element == '') {
      return pageId;
    } else {
      return element;
    }
  });

  renderContent();
  setGalleryWidth();
  setMinCardWidth();
}

// Изменение URL без перезагрузки страницы:

window.addEventListener('popstate', openPage);

var oldPath,
    newUrl,
    urlPath;

function openPage() {
  event.preventDefault();

  if (event.type == 'popstate') {
    if (event.state) {
      path = event.state.path;
    } else {
      return;
    }
  } else {
    oldPath = path;
    newUrl = event.currentTarget.dataset.href.split('?');
    path = Array.from(document.querySelector('.header-menu').querySelectorAll('.active'))
      .filter(element => element.dataset.level < event.currentTarget.dataset.level)
      .map(element => element.dataset.href);
    path = path.concat(newUrl);

    if (path.length === oldPath.length && JSON.stringify(oldPath) == JSON.stringify(path)) {
      return;
    }

    urlPath = path
      .map(element => {
        if (element == pageId) {
          return location.href.split('?')[0];
        } else {
          return '?' + element;
        }
      })
      .join('');

    window.history.pushState({'path': path},'', urlPath);
  }
  renderContent();
}

// Изменение контента страницы:

function renderContent() {
  if (path[path.length - 1] == 'snegohod' || path[path.length - 1] == 'lodkimotor') {
    zipUrl.href = location.href + '?zip';
    accUrl.href = location.href + '?acc';
  }
  if (location.search && !(location.search.indexOf('=') >= 0)) {
    changePageTitle(path);
  }
  toggleMenuItems(path);
  createMainNav(path);
  sectionId = document.querySelector('.topmenu-item.active').dataset.id;
  if (path[path.length - 1] == 'cart') {
    renderCart();
  } else {
    renderGallery(path);
  }
  setDocumentScroll(0);
  setPaddingToBody();
}

// Изменение заголовка страницы:

var curEl;

function changePageTitle() {
  curEl = document.querySelector(`[data-href="${path[path.length - 1]}"]`);
  document.title = `ТОП СПОРТС - ${curEl.dataset.title ? curEl.dataset.title : curEl.textContent}`;
}

// Изменение разделов меню:

var curMenuItem;

function toggleMenuItems() {
  document.querySelectorAll('.header-menu .active').forEach(item => item.classList.remove('active'));
  for (key of path) {
   curMenuItem = document.querySelector(`[data-href="${key}"]`);
    if (curMenuItem) {
      curMenuItem.classList.add('active');
    }
  }
}

// Изменение хлебных крошек:

function createMainNav() {
  list = '';
  path.forEach((curUrl, i) => {
    curMenuItem = document.querySelector(`[data-href="${curUrl}"]`);
    if (curMenuItem) {
      newItem = navItemTemplate
      .replace('#isCurPage#', i == path.length - 1 ? 'cur-page' : '')
      .replace('#pageUrl#', curUrl)
      .replace('#pageTitle#', curMenuItem.dataset.title ? curMenuItem.dataset.title : curMenuItem.textContent);
      list += newItem;
    }
  });
  mainNav.innerHTML = mainNavTemplate.replace(navItemTemplate, list);
  mainHeader.style.display = 'flex';
}

// Создание контента галереи:

function renderGallery() {
  window.removeEventListener('scroll', scrollGallery);
  window.removeEventListener('resize', scrollGallery);
  window.addEventListener('scroll', scrollGallery);
  window.addEventListener('resize', scrollGallery);

  if (headerCart) {
    submenu.style.display = '';
    search.style.visibility = 'visible';
    mainMenuBtns.style.visibility = 'visible';
    mainInfo.style.display = '';
    cart.style.display = 'none';
    cartInfo = getInfo('cart')[sectionId];
    changeHeaderCart();
  }
  if (subsubmenu) {
    if (document.querySelector(`[data-href="${path[path.length - 1]}"]`).dataset.level >= 2) {
      subsubmenu.style.display = 'block';
    } else {
      subsubmenu.style.display = 'none';
    }
  }
  if (headerSelect) {
    if (path[path.length - 1] == 'zip') {
      headerSelect.style.display = 'block';
    } else {
      headerSelect.style.display = 'none';
    }
  }
  curItems = items;
  for (key of path) {
    if (key != pageId) {
      if (key.includes('=')) {
        removeAllFiltersInfo();
        saveFiltersInfo(key.split('=')[0], key.split('=')[1]);
      } else {
        curItems = curItems.filter(item => item[key] == 1);
      }
    }
  }
  prepeareForSearch(curItems);
  if (searchInfo.style.visibility == 'visible') {
    clearSearch();
  }
  pageUrl = location.search && !location.search.includes('=') ? pageId + location.search : pageId;

  dataForPageFilters = JSON.parse(JSON.stringify(dataForFilters));
  if (typeof catId != 'undefined' && Object.keys(catId).indexOf(path[path.length - 1]) >= 0) {
    var dataCats = createDataCats(catId[path[path.length - 1]]);
    dataForPageFilters.splice(1, 1, dataCats);
  }
  selecledCardList = '';
  initFilters();
  checkFilters();
}

//=====================================================================================================
//  Функции для создания фильтров на странице:
//=====================================================================================================

// Создание фильтра категорий в экипировке:

var cat;

function createDataCats(id) {
  cat = {};
  for (key in cats) {
    if (cats[key] == id) {
      cat[key] = '1';
    }
  }
  return {
    title: 'Категория',
    isOpen: true,
    key: 'cat',
    items: sortObjByKey(cat)
  }
}

// Отображение фильтров на странице:

var data;

function initFilters() {
  console.log('initFilters');
  data = JSON.parse(JSON.stringify(dataForPageFilters));
  curItemsArray = curItems;
  isExsist = false;

  if (selecledCardList !== '') {
    curItemsArray = selecledCardList;
  }

  for (item of data) {
    for (k in item.items) {
      isExsist = curItemsArray.find(card => {
        if (card[item.key] == k || card[k] == 1) {
          return true;
        }
      });
      if (!isExsist) {
        delete item.items[k];
      }
      if (typeof item.items[k] == 'object') {
        for (kk in item.items[k]) {
          isExsist = curItemsArray.find(card => {
            if (card[item.key] == k && card.subcat == item.items[k][kk]) {
              return true;
            }
          });
          if (!isExsist) {
            delete item.items[k][kk];
          }
        }
      }
    }
  }

  menuFilters.innerHTML = createFilters(data);
  filtersContainer.style.display = 'block';
  setMaxHeight();
  addTooltips('color');
}

// Установка максимальной высоты фильтров для их анимации:

var totalHeight;

function setMaxHeight() {
  document.querySelectorAll('.filter-items').forEach(el => {
    totalHeight = 0
    el.querySelectorAll('.filter-item').forEach(item => {
      totalHeight += item.clientHeight;
    });
    if (totalHeight > 0) {
      el.style.maxHeight = totalHeight + 'px';
    }
  })
}

// Создание меню фильтров:

function createFilters(data) {
  list = data.map(element => {
    if (Object.keys(element.items).length > 0) {
      return createFilter(element);
    }
  }).join('');
  return list;
}

// Создание одного фильтра:

var curTitle,
    isHiddenOpenBtn;

function createFilter(data) {
  newItem = filterTemplate;
  list = '';
  for (k in data.items) {
    subList = '',
    isHiddenOpenBtn = 'hidden';

    if (typeof data.items[k] === 'object') {
      for (kk in data.items[k]) {
        if (data.items[k][kk] !== '') {
          isHiddenOpenBtn = '';
          newSubItem = filterSubitemTemplate
          .replace('#key#', data.key)
          .replace('#subkey#', k)
          .replace('#value#', data.items[k][kk])
          .replace('#title#', data.items[k][kk])
          subList += newSubItem;
        }
      }
    }

    if ((data.items[k] == 1) || (data.key == 'cat')) {
      curTitle = k;
    } else {
      curTitle = data.items[k];
    }

    newSubItem = filterItemTemplate
      .replace(filterSubitemTemplate, subList)
      .replace('#key#', data.key)
      .replace('#value#', k)
      .replace('#title#', curTitle)
      .replace('#isHiddenOpenBtn#', isHiddenOpenBtn);
    list += newSubItem;
  }
  newItem = newItem
    .replace(filterItemTemplate, list)
    .replace('#key#', data.key)
    .replace('#isOpen#', data.isOpen && window.innerWidth >= 767 ? 'default-open' : 'close')
    .replace('#title#', data.title);
  return newItem;
}

//=====================================================================================================
//  Функции для работы с фильтрами:
//=====================================================================================================

var filterItem;

// Отображение/ скрытие фильтра:

function toggleFilter(event) {
  if (event.target.classList.contains('filter-title')) {
    event.currentTarget.classList.toggle('close');
    // filters.scrollTop = event.currentTarget.offsetTop;
  }
}

// Отображение/ скрытие подфильтра:

function toggleFilterItem(event) {
  filterItem = event.currentTarget.closest('.filter-item');
  if (filterItem.classList.contains('disabled')) {
    return;
  }
  filterItem.classList.toggle('close');
}

// Выбор значения фильтра:

var subItems;

function selectFilterValue(event) {
  event.stopPropagation();
  if (event.target.classList.contains('open-btn') || event.currentTarget.classList.contains('disabled')) {
    return;
  }

  getDocumentScroll();
  curEl = event.currentTarget;
  key = curEl.dataset.key;
  value = curEl.dataset.value;
  subkey = curEl.dataset.subkey;

  if (curEl.classList.contains('checked')) {
    curEl.classList.remove('checked');
    curEl.classList.add('close');
    subItems = curEl.querySelectorAll('.filter-item.checked');
    if (subItems) {
      subItems.forEach(subItem => subItem.classList.remove('checked'));
    }
    removeFiltersInfo(key, value, subkey);
  } else {
    curEl.classList.add('checked');
    curEl.classList.remove('close');
    filterItem = curEl.closest('.filter-item.item');
    if (filterItem) {
      filterItem.classList.add('checked');
    }
    saveFiltersInfo(key, value, subkey);
  }
  filtersInfo = getInfo('filters')[pageUrl];
  if (filtersInfo && Object.keys(filtersInfo).length == 0) {
    selecledCardList = '';
  } else {
    selectCards(filtersInfo);
  }
  showCards();
  if (searchInfo.style.visibility == 'visible') {
    clearSearchInfo();
  }
  toggleToActualFilters(event.currentTarget);

  if (window.innerWidth >= 767) {
    if (filters.style.position === 'static') {
      setDocumentScroll(scrollTop);
    }
  } else {
    setDocumentScroll(scrollTop);
  }
}

// Добавление данных в хранилище о выбранных фильтрах:

function saveFiltersInfo(key, value, subkey) {
  filtersInfo = getInfo('filters');
  if (!filtersInfo[pageUrl]) {
    filtersInfo[pageUrl] = {};
  }
  if (!filtersInfo[pageUrl][key]) {
    filtersInfo[pageUrl][key] = {};
  }
  if (subkey) {
    if (!filtersInfo[pageUrl][key][subkey]) {
      filtersInfo[pageUrl][key][subkey] = {};
    }
    if (!filtersInfo[pageUrl][key][subkey][value]) {
      filtersInfo[pageUrl][key][subkey][value] = {};
    }
  } else {
    if (!filtersInfo[pageUrl][key][value]) {
      filtersInfo[pageUrl][key][value] = {};
    }
  }
  saveInfo('filters', filtersInfo);
}

// Удаление данных из хранилища о выбранных фильтрах:

function removeFiltersInfo(key, value, subkey) {
  filtersInfo = getInfo('filters');
  if (!subkey) {
    delete filtersInfo[pageUrl][key][value];
    if (Object.keys(filtersInfo[pageUrl][key]).length == 0) {
      delete filtersInfo[pageUrl][key];
    }
  } else {
    delete filtersInfo[pageUrl][key][subkey][value];
    if (filtersInfo[pageUrl][key][subkey] && Object.keys(filtersInfo[pageUrl][key][subkey]).length == 0) {
      filtersInfo[pageUrl][key][subkey] = {};
    }
  }
  saveInfo('filters', filtersInfo);
}

// Удаление данных из хранилища обо всех фильтрах:

function removeAllFiltersInfo() {
  filtersInfo = getInfo('filters');
  filtersInfo[pageUrl] = {};
  saveInfo(`filters`, filtersInfo);
}

// Фильтрация карточек:

function selectCards(filtersInfo) {
  if (!filtersInfo) {
    return;
  }

  selecledCardList = curItems.filter(card => {
    for (k in filtersInfo) {
      isFound = false;
      for (kk in filtersInfo[k]) {
        if (filtersInfo[k][kk] && Object.keys(filtersInfo[k][kk]).length != 0) {
          for (kkk in filtersInfo[k][kk]) {
            if (card.cat == kk && card.subcat == kkk) {
              isFound = true;
            }
          }
        } else {
          if (card[k] == kk || card[kk] == 1) {
            isFound = true;
          }
        }
      }
      if (!isFound) {
        return false;
      }
    }
    return true;
  });
}

// Блокировка лишних фильтров:

var filterItems,
    curFilters,
    checked;

function toggleToActualFilters(filter) {
  curItemsArray = curItems;
  isExsist =  false;

  if (selecledCardList !== '') {
    curItemsArray = selecledCardList;
  }
  curFilters = menuFilters.querySelectorAll(`.filter-item.item.checked[data-key="${filter.dataset.key}"]`);
  checked = menuFilters.querySelectorAll(`.filter-item.item.checked`);

  if (curFilters.length != 0) {
    filterItems = menuFilters.querySelectorAll(`.filter-item.item:not([data-key="${filter.dataset.key}"])`);
  } else {
    filterItems = menuFilters.querySelectorAll(`.filter-item.item`);
  }

  for (item of filterItems) {
    key = item.dataset.key;
    value = item.dataset.value;

    if (checked.length == 1 && key == checked[0].dataset.key) {
      item.classList.remove('disabled');
    } else {
      isExsist = curItemsArray.find(card => {
        if (card[key] == value || card[value] == 1) {
          item.classList.remove('disabled');
          return true;
        }
      });
      if (!isExsist) {
        item.classList.add('disabled');
        item.classList.add('close');
        if (item.classList.contains('checked')) {
          item.classList.remove('checked');
          item.querySelectorAll('.subitem').forEach(subitem => {
            subitem.classList.remove('checked');
          });
          removeFiltersInfo(item.dataset.key, item.dataset.value);
        }
      }
      item.querySelectorAll('.subitem').forEach(subitem => {
        isFound = false;
        isFound = curItemsArray.find(card => {
          if (card.cat == value && card.subcat == subitem.dataset.value) {
            return true;
          }
        });
        if (!isFound) {
          subitem.classList.add('disabled');
        } else {
          subitem.classList.remove('disabled');
        }
      });
    }
  }
}

// Очистка всех фильтров:

function clearFilters() {
  if (!menuFilters.querySelector('.checked')) {
    return;
  }
  getDocumentScroll();
  removeAllFiltersInfo();

  menuFilters.querySelectorAll('.filter-item').forEach(el => {
    el.classList.remove('checked', 'disabled');
    if (el.classList.contains('default-open')) {
      el.classList.remove('close');
    } else {
      el.classList.add('close');
    }
  });

  if (searchInfo.style.visibility == 'visible') {
    return;
  }

  selecledCardList = '';
  showCards();
  setDocumentScroll(scrollTop);
}

// Проверка сохраненных значений фильтров:

function checkFilters() {
  filtersInfo = getInfo('filters')[pageUrl];
  if (filtersInfo && Object.keys(filtersInfo).length > 0){
    checkFilterExist();
    selectFilters();
  }
  showCards();
}

// Удаление сохраненных фильтров, если их больше нет на странице:

function checkFilterExist() {
  for (k in filtersInfo) {
    for (kk in filtersInfo[k]) {
      var el = document.querySelector(`[data-key="${k}"][data-value="${kk}"]`);
      if (!el) {
        delete filtersInfo[k][kk];
      }
      for (kkk in filtersInfo[k][kk]) {
        var el = document.querySelector(`[data-subkey="${kk}"][data-value="${kkk}"]`);
        if (!el) {
          delete filtersInfo[k][kk][kkk];
        }
        if (Object.keys(filtersInfo[k][kk]).length == 0) {
          delete filtersInfo[k][kk];
        }
      }
      if (Object.keys(filtersInfo[k]).length == 0) {
        delete filtersInfo[k];
      }
    }
  }
}

// Визуальное отображение сохраненных фильтров:

var filtersForSelect;

function selectFilters() {
  filtersForSelect = {};
  for (i in filtersInfo) {
    filtersForSelect[i] = {};
    filterItem = document.getElementById(`filter-${i}`);
    if (filterItem) {
      filterItem.classList.remove('close');
    }
    for (ii in filtersInfo[i]) {
      filtersForSelect[i][ii] = {};
      selectCards(filtersForSelect);
      changeFilterClass(i, ii);
      for (iii in filtersInfo[i][ii]) {
        filtersForSelect[i][ii][iii] = {};
        selectCards(filtersForSelect);
        changeFilterClass(i, iii, ii);
      }
    }
  }
}

// Изменение классов сохраненных фильтров:

function changeFilterClass(key, value, subkey) {
  if (subkey) {
    curEl = document.querySelector(`[data-subkey="${subkey}"][data-value="${value}"]`);
  } else {
    curEl = document.querySelector(`[data-key="${key}"][data-value="${value}"]`);
  }
  if (curEl) {
    curEl.classList.add('checked');
    filterItem = curEl.closest('.filter-item');
    if (filterItem) {
      filterItem.classList.remove('close');
    }
    toggleToActualFilters(curEl);
  }
}

//=====================================================================================================
//  Функции для отображения карточек товаров на странице:
//=====================================================================================================

// Создание карточек товаров из массива:

var itemsToLoad,
    incr,
    curCards;

function loadCards(cards) {
	if (cards){
    countItems = 0;
    itemsToLoad = cards;
	}
	else {
    countItems = countItemsTo;
  }

  if (window.innerWidth > 2000) {
    if (view == 'list') {
      incr = 30;
    } else {
      incr = 60;
    }
  } else if (window.innerWidth < 1080) {
    if (view == 'list') {
      incr = 10;
    } else {
      incr = 20;
    }
  } else {
    if (view == 'list') {
      incr = 20;
    } else {
      incr = 40;
    }
  }
  countItemsTo = countItems + incr;
  if (countItemsTo > itemsToLoad.length) {
    countItemsTo = itemsToLoad.length;
  }

  var listCard = '';
  for (var i = countItems; i < countItemsTo; i++) {
    var card = createCard(itemsToLoad[i]);
    listCard += card;
  }

  if (countItems === 0) {
    gallery.innerHTML = listCard;
  } else {
    gallery.insertAdjacentHTML('beforeend', listCard);
  }
  setFiltersPosition();
  setGalleryWidth();
  setMinCardWidth();

  if (view == 'list') {
    curCards = document.querySelectorAll('.big-card');
    for (var i = countItems; i < countItemsTo; i++) {
      if (headerCart) {
        checkCart(curCards[i]);
      }
      renderCarousel(curCards[i].querySelector('.carousel'));
    }
  }
}

// Создание одной карточки товара :

var newCard,
    manufData,
    props,
    propRegExp,
    propCard;

function createCard(card) {
  newCard = cardTemplate.outerHTML;

  if (cardTemplate != minCardTemplate) {
    if (card.manuf) {
      try {
        manufData = JSON.parse(card.manuf);
      }
      catch(error) {
        console.error(error);
      }
    }

    template = cardTemplate.querySelector('.card-options').innerHTML;
    list = createOptions(template, card, manufData);
    newCard = newCard.replace(template, list);

    if (manufData && Object.keys(manufData.man).length > 1) {
      template = cardTemplate.querySelector('.manuf-row').outerHTML;
      list = createManuf(template, manufData);
      newCard = newCard.replace(template, list);
    }

    template = cardTemplate.querySelector('.card-sizes').innerHTML;
    list = createSizes(template, card);
    newCard = newCard.replace(template, list);

    template = cardTemplate.querySelector('.carousel-gallery').innerHTML;
    list = createCarousel(template, card);
    newCard = newCard.replace(template, list);
  }

  props = extractProps(newCard);
  for (key of props) {
    propRegExp = new RegExp('#' + key + '#', 'gi');
    if (key == 'images') {
      propCard = `http://b2b.topsports.ru/c/productpage/${card.images[0]}.jpg`;
    } else if (key == 'isHiddenPrice' && card.price_preorder1 == 0) {
      propCard = 'displayNone';
    } else if (key == 'isHiddenPromo') {
      propCard = card.actiontitle == undefined ? 'hidden' : '';
    } else if (key == 'isAvailable') {
      propCard = card.free_qty > 0 ? '' : 'not-available';
    } else if (key == "qtyTitle") {
      propCard = card.free_qty > 0 ? 'В наличии' : 'Ожидается';
    } else if (key == 'notice') {
      propCard = card.free_qty > 0 ? 'Товар резервируется в момент подтверждения заказа!' : 'Товара нет в наличии!';
    } else if (key == 'isHiddenManuf') {
      propCard = manufData && Object.keys(manufData.man).length > 1 ? '' : 'displayNone';
    } else if (key == 'isHiddenDesc') {
      propCard = card.desc == '' ? 'displayNone' : '';
    } else if (card[key] == undefined) {
      propCard = '';
    } else {
      propCard = card[key];
    }
    newCard = newCard.replace(propRegExp, propCard);
  }
  return newCard;
}

// Создание описания опций в карточке товара:

var option;

function createOptions(template, card, manufData) {
  list = '';
  if (card.options && card.options != 0) {
    for (option in card.options) {
      if ((option == 7 || option == 31 || option == 32 || option == 33) && manufData && Object.keys(manufData.man).length > 1) {
        continue;
      } else {
        newItem = template
          .replace('#optitle#', optnames[option])
          .replace('#option#', card.options[option]);
        list += newItem;
      }
    }
  }
  return list;
}


// Создание таблицы с данными о производителе:

var titles,
    newCell,
    cell;

function createManuf(template, manufData) {
  list = '';
  subTemplate = cardTemplate.querySelector('.manuf-row').innerHTML;
  titles = Array.from(manufTitle.querySelectorAll('div')).map(element => element.dataset.title);

  for (item in manufData.man) {
    newItem = template;
    subList = '';

    for (k of titles) {
      newCell = subTemplate;
      cell = [];
      for (kk in manufData[k]) {
        if (kk == item) {
          cell.push(kk);
        } else {
          for (kkk in manufData[k][kk]) {
            if (kkk == item) {
              cell.push(kk);
            }
          }
        }
      }
      if (cell.length == 0) {
        cell.push('&ndash;');
        cell = cell.join(', ');
      } else {
        cell = cell.join(', ');
        if (k == 'years') {
          cell = convertYears(cell);
        }
      }

      newCell = newCell
        .replace('#cat#', k)
        .replace('#info#', cell);
      subList += newCell;
    }
    newItem = newItem.replace(subTemplate, subList);
    list += newItem;
  }
  return list;
}

// Создание информации о размерах:

function createSizes(template, card) {
  list = '';
  if (card.sizes && card.sizes != 0) {
    for (key in card.sizes) {
      createSize(card.sizes[key]);
    }
  } else {
    createSize(card);
  }
  function createSize(sizeInfo) {
    newItem = template
    .replace(/#id#/gi, sizeInfo.object_id)
    .replace('#articul#', sizeInfo.articul)
    .replace('#isClick#', sizeInfo.size ? '' : 'click')
    .replace('#size#', sizeInfo.size ? sizeInfo.size : 'В корзину')
    .replace('#qtyTitle#', sizeInfo.free_qty > 0 ? 'В наличии' : 'Ожидается')
    .replace('#isAvailable#', sizeInfo.free_qty > 0 ? '' : 'not-available')
    .replace('#free_qty#', sizeInfo.free_qty)
  list += newItem;
  }
  return list;
}

// Создание карусели:

function createCarousel(template, card) {
  list = '';
  for (i = 0; i < card.images.length; i++) {
    var newItem = template
      .replace('#image#', `http://b2b.topsports.ru/c/productpage/${card.images[i]}.jpg`)
      .replace('#full-image#', `http://b2b.topsports.ru/c/source/${card.images[i]}.jpg`);
    list += newItem;
  }
  return list;
}

// Проверка загруженности всех изображений карусели и отображение карусели:

var curImgs;

function renderCarousel(carousel, curImg = 0, isFull) {
  curImgs = carousel.querySelectorAll('img')
  curImgs.forEach(img => {
    img.addEventListener('error', () => {
      img.parentElement.remove();
    });
  });
  curImgs[curImgs.length - 1].addEventListener('load', render);
  curImgs[curImgs.length - 1].addEventListener('error', () => render);
  function render() {
    startCarouselInit(carousel, curImg);
    if (isFull) {
      fullImg.style.opacity = 1;
      imgLoader.style.visibility = 'hidden';
    }
  }
}

//=====================================================================================================
//  Функции для работы с карточками товаров:
//=====================================================================================================

// Отображение карточек на странице:

function showCards() {
  if (selecledCardList === '') {
    gallery.style.display = 'flex';
    galleryNotice.style.display = 'none';
    loadCards(curItems);
  } else {
    if (selecledCardList.length == 0) {
      galleryNotice.style.display = 'flex';
      gallery.style.display = 'none';
      setFiltersPosition();
    } else {
      gallery.style.display = 'flex';
      galleryNotice.style.display = 'none';
      loadCards(selecledCardList);
    }
  }
}

// Добавление новых карточек при скролле страницы:

function scrollGallery() {
  console.log('scroll');
  scrolled = window.pageYOffset || document.documentElement.scrollTop;
  if (scrolled * 2 + window.innerHeight >= document.body.clientHeight) {
    loadCards();
  }
}

// Переключение вида отображения карточек на странице:

function toggleView(newView) {
  if (view != newView) {
    document.querySelector(`.view-${view}`).classList.remove('active');
    event.currentTarget.classList.add('active');
    content.classList.remove(`${view}`);
    content.classList.add(`${newView}`);
    view = newView;
    setCardTemplate();
    showCards();
  }
}

function setCardTemplate() {
  if (view == 'blocks') {
    cardTemplate = minCardTemplate;
  }
  if (view == 'list') {
    cardTemplate = bigCardTemplate;
  }
}

// Раскрытие в полный размер большой карточки:

var curCard;

function openBigCard(event) {
  curCard = event.currentTarget.closest('.big-card');
  curCard.classList.toggle('open');
  if (curCard.classList.contains('open')) {
    event.currentTarget.setAttribute('tooltip', 'Свернуть');
  } else {
    event.currentTarget.setAttribute('tooltip', 'Раскрыть');
  }
  setFiltersPosition();
}

function closeBigCard(event) {
  curCard = event.currentTarget.closest('.big-card');
  if (window.innerWidth < 767) {
    if (!(event.target.classList.contains('toggle-btn') || event.target.closest('.carousel') || event.target.closest('.card-size') || event.target.classList.contains('dealer-button'))) {
      curCard.classList.remove('open');
      curCard.querySelector('.toggle-btn').setAttribute('tooltip', 'Раскрыть');
      setFiltersPosition();
    }
  }
}

// Отображение полной карточки товара:

var curCarousel;

function showFullCard(id) {
  getDocumentScroll();
  cardTemplate = fullCardTemplate;
  curCard = createCard(items.find(item => item.object_id == id));
  fullCardContainer.innerHTML = curCard;
  if (headerCart) {
    checkCart(document.querySelector('.full-card'));
    changeCardInfo(document.querySelector('.full-card'));
  }
  fullCardContainer.style.display = 'flex';
  curCarousel = fullCardContainer.querySelector('.carousel');
  renderCarousel(curCarousel);

  curCarousel.querySelector('.carousel-gallery-wrap').addEventListener('click', () => showFullImg(id));
  curCarousel.querySelector('.search-btn').addEventListener('click', () => showFullImg(id));

  document.body.classList.add('no-scroll');
  setCardTemplate();
}

// Скрытие полной карточки товара:

function closeFullCard(event) {
  if (!(event.target.closest('.carousel') || event.target.closest('.card-size') || event.target.classList.contains('dealer-button'))) {
    fullCardContainer.style.display = 'none';
    document.body.classList.remove('no-scroll');
    setDocumentScroll(scrollTop);
  }
}

// Отображение картинки полного размера на экране:

var imgs,
    curImg;

function showFullImg(id) {
  if (event.target.classList.contains('btn')) {
    return;
  }
  // event.preventDefault();
  getDocumentScroll();
  fullImgContainer.style.display = 'block';
  imgLoader.style.visibility = 'visible';
  fullImg.style.opacity = 0;
  list = '';
  imgs = curItems.find(item => item.object_id == id).images;

  for (i = 0; i < imgs.length; i++) {
    newItem = carouselItemTemplate.replace('#imgNumb#', i);
    if (window.innerWidth > 400) {
      newItem = newItem.replace('#image#', `http://b2b.topsports.ru/c/source/${imgs[i]}.jpg`);
    } else {
      newItem = newItem.replace('#image#', `http://b2b.topsports.ru/c/productpage/${imgs[i]}.jpg`);
    }
    list += newItem;
  }
  fullImg.innerHTML = fullImgTemplate.replace(carouselItemTemplate, list);

  curCarousel = fullImgContainer.querySelector('.carousel');
  curImg = event.currentTarget.closest('.carousel').dataset.img;

  renderCarousel(curCarousel, curImg, true);

  document.body.classList.add('no-scroll');
}

// Скрытие картинки полного размера:

function closeFullImg() {
  if (event.target.classList.contains('btn')) {
    return;
  }
  fullImgContainer.style.display = 'none';
  document.body.classList.remove('no-scroll');
  setDocumentScroll(scrollTop);
}

//=====================================================================================================
//  Сортировка карточек товаров:
//=====================================================================================================

// Сортировка карточек товаров на странице:

var selectedOption;

function sortItems() {
  selectedOption = gallerySort.value;
  curItems.sort(dynamicSort(selectedOption));
  if (selecledCardList !== '') {
    selecledCardList.sort(dynamicSort(selectedOption));
  }
  showCards();
}

// Сортировка массива объектов по указанному значению:

var sortOrder,
    result;

function dynamicSort(property) {
  sortOrder = 1;
  if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
  }
  if (property == 'price1') {
    return function (a, b) {
      result = a[property] - b[property];
      return result * sortOrder;
    }
  } else {
    return function (a, b) {
      result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }
}

//=====================================================================================================
// Поиск на странице:
//=====================================================================================================

// Подготовка данных для поиска на странице:

function prepeareForSearch(data) {
  itemsForSearch = JSON.parse(JSON.stringify(data)).map(el => {
      delete el.desc;
      return {object_id: el.object_id, value: convertToString(el)};
    });
}

// Конвертация всей вложенности свойств объекта в строку:

var objProps,
    prop;

function convertToString(obj) {
  objProps = '';
  crossObj(obj);
  return objProps;

  function crossObj(obj) {
    prop;
    for (k in obj) {
      prop = obj[k];
      if (typeof prop === 'string') {
        objProps += prop + ',';
      } else if (typeof prop === 'object') {
        crossObj(prop);
      }
    }
  }
}

// Поиск совпадений с введенным текстом:

var textToFind,
    regExpSearch,
    checkedText;

function findOnPage(event) {
  event.preventDefault();
  textToFind = searchInput.value
    .trim()
    .replace(/\, /gi, ',')
    .replace(/\/ /gi, '/')
  if (textToFind == '') {
    return;
  }
  regExpSearch = new RegExp(textToFind, 'i');
  selecledCardList = [];
  itemsForSearch.filter(el => el.value.search(regExpSearch) >= 0).forEach(el => selecledCardList.push(curItems.find(item => item.object_id == el.object_id)));
  showCards();
  clearSearchBtn.style.display = 'block';
  searchCount.textContent = selecledCardList.length;
  searchInfo.style.visibility = 'visible';
}

// Очистка поиска:

function clearSearch() {
  clearSearchInfo();
  selecledCardList = '';
  checkFilters();
}

// Очистка поля поиска и поля вывода результата:

function clearSearchInfo() {
  search.classList.remove('open');
  clearSearchBtn.style.display = 'none';
  searchInfo.style.visibility = 'hidden';
  searchInput.value = '';
}
