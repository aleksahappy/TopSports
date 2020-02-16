'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var pageSearch = document.getElementById('page-search'),
    zipSelect = document.getElementById('zip-select'),
    mainHeader = document.getElementById('main-header'),
    mainNav = document.getElementById('main-nav'),
    mainInfo = document.getElementById('main-info'),
    content = document.getElementById('content'),
    headerContent = document.getElementById('header-content'),
    filtersContainer = document.getElementById('filters-container'),
    filters = document.getElementById('filters'),
    menuFilters = document.getElementById('menu-filters'),
    filtersInfo = document.getElementById('filters-info'),
    gallery = document.getElementById('gallery'),
    galleryNotice = document.getElementById('gallery-notice'),
    fullCardContainer = document.getElementById('full-card-container'),
    fullImgContainer = document.getElementById('full-img-container');

if (pageSearch) {
  var pageSearchInput = document.getElementById('page-search-input'),
      pageSearchInfo = document.getElementById('search-info'),
      clearPageSearchBtn = pageSearch.querySelector('.close.icon');
}
if (zipSelect) {
  var selectMan = document.getElementById('select-man'),
      selectYears = document.getElementById('select-years'),
      selectModel = document.getElementById('select-model'),
      manDropDown = new DropDown(selectMan),
      yearsDropDown = new DropDown(selectYears),
      modelDropDown = new DropDown(selectModel),
      clearZipFilterBtn = zipSelect.querySelector('.zip-filters').querySelector('.close.icon'),
      oemSearch = document.getElementById('oem-search'),
      oemSearchInput = document.getElementById('oem-search-input'),
      oemDropdown =  document.getElementById('oem-dropdown'),
      oemList = document.getElementById('oem-list'),
      oemNotFound = document.getElementById('oem-not-found'),
      clearOemSearchBtn = oemSearch.querySelector('.close.icon');

  // Обработчики событий:

  selectMan.addEventListener('change', selectCardsZipFilter);
  selectYears.addEventListener('change', selectCardsZipFilter);
  selectModel.addEventListener('change', selectCardsZipFilter);
}

// Получение шаблонов из HTML:

var minCardTemplate = document.getElementById('min-card-#object_id#'),
    bigCardTemplate = document.getElementById('big-card-#object_id#'),
    fullCardTemplate = document.getElementById('full-card-#object_id#'),
    productCardTemplate = document.getElementById('product-card-#object_id#');

if (mainNav) {
  var mainNavTemplate = mainNav.innerHTML,
      navItemTemplate = mainNav.querySelector('.item').outerHTML;
}
if (zipSelect) {
  var selectManufItemTemplate = selectMan.querySelector('.drop-down').innerHTML,
      oemListTemplate = oemList.innerHTML;
}
if (menuFilters) {
  var filterTemplate = menuFilters.querySelector('.filter').outerHTML,
      filterItemTemplate = menuFilters.querySelector('.filter-item').outerHTML,
      filterSubitemTemplate = menuFilters.querySelector('.filter-item.subitem').outerHTML;
}
if (filtersInfo) {
  var duplicateFilterTemplate = filtersInfo.innerHTML;
  clearFiltersInfo();
}
if (fullImgContainer) {
  var fullImg = document.getElementById('full-img'),
      fullImgTemplate = fullImg.innerHTML,
      fullCarouselTemplate = fullImg.querySelector('.carousel-gallery').innerHTML;
}

// Динамические переменные:

var items,
    cartItems = {},
    view = 'list',
    cardTemplate,
    curItems,
    selectedItems = '',
    itemsForSearch,
    zipFilterData = {},
    pageUrl = pageId;

//=====================================================================================================
// При запуске страницы:
//=====================================================================================================

if (view != 'product') {
  convertItems();
}

if (isCart) {
  window.addEventListener('focus', updateCart);

  if (view === 'product') {
    getProduct(location.search.replace('?',''))
    .then(
      result => {
        items = [result];
        convertItems();
        showPage();
      },
      reject => {
        loader.hide();
        message.show('Данные не загружены.');
      }
    )
  } else {
    showPage();
  }
} else {
  document.addEventListener('DOMContentLoaded', () => {
    initPage();
  });
}

// Запуск инициализации страницы:

function showPage() {
  getCart()
  .then(result => {
    initPage();
  })
  .catch(err => {
    console.log(err);
    initPage();
  });
}

//=====================================================================================================
// Запросы на сервер:
//=====================================================================================================

// Получение данных о конкретном товаре:

function getProduct(id) {
  return new Promise((resolve, reject) => {
    sendRequest(urlRequest + 'product' + id)
    .then(
      result => {
        var product = JSON.parse(result);
        resolve(product);
      }
    )
    .catch(error => {
      reject();
    })
  });
}

//=====================================================================================================
// // Преобразование исходных данных:
//=====================================================================================================

// Преобразование:
// - данных о картинках в карточке товара из строки в массив;
// - данных о годах в укороченный формат

// Добавление:
// - данных о текущей цене
// - общего количества

// Создание:
// - объекта в разрезе размеров для корзины

function convertItems() {
  if (pageId == '_boats') {
    items = items.filter(el => el.lodkimotor == 1);
  }
  if (pageId == '_snow') {
    items = items.filter(el => el.snegohod == 1);
  }
  var manuf, size, id;
  items.forEach(item => {
    item.images = item.images.toString().split(';');
    item.image = `http://b2b.topsports.ru/c/productpage/${item.images[0]}.jpg`;
    if (cartId.indexOf('preorder') >= 0) {
      item.price_cur = item.price_preorder;
      item.price_cur1 = item.price_preorder1;
    } else {
      item.price_cur = item.price_action1 > 0 ? item.price_action : item.price;
      item.price_cur1 = item.price_action1 > 0 ? item.price_action1 : item.price1;
    }
    item.total_qty = parseInt(item.free_qty, 10) + parseInt(item.arrive_qty, 10);
    if (item.sizes && item.sizes != 0) {
      for (let key in item.sizes) {
        size = item.sizes[key];
        id = item.sizes[key].object_id;
        size.total_qty = parseInt(size.free_qty, 10) + parseInt(size.arrive_qty, 10);
        cartItems['id_' + id] = Object.assign({}, size);
        cartItems['id_' + id].id = id;
        for (let key in item) {
          if (key === 'object_id' || key != 'sizes' && !cartItems['id_' + id][key]) {
            cartItems['id_' + id][key] = item[key];
          }
        }
      }
    } else {
      cartItems['id_' + item.object_id] = Object.assign({}, item);
      cartItems['id_' + item.object_id].id = cartItems['id_' + item.object_id].object_id;
    }
    if (item.manuf) {
      try {
        manuf = JSON.parse(item.manuf);
      } catch(error) {
        item.manuf = 0;
      }
      item.manuf = manuf;
    }
  });
  items.sort(dynamicSort(('catid')));
}

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Настройка каруселей:

var fullCardCarousel = {
  isNav: true,
  durationNav: 400,
  isLoupe: true
};

var fullImgCarousel = {
  durationNav: 400
};

// Установка ширины галереи:

function setGalleryWidth() {
  gallery.style.width = (content.clientWidth - filters.clientWidth - 30) + 'px';
  setMinCardWidth();
}

// Установка ширины малых карточек товаров:

function setMinCardWidth() {
  if (!content.classList.contains('blocks')) {
    return;
  }
  var width = 18;
  if (website === 'skipper') {
    width = 13;
  }
  var standartWidth = (width * parseInt(getComputedStyle(gallery).fontSize, 10)),
      countCards = Math.floor(gallery.clientWidth / standartWidth),
      restGallery = gallery.clientWidth - countCards * standartWidth,
      changeMinCard = restGallery / countCards,
      minCardWidth = 0;
  if (changeMinCard <= 110) {
    minCardWidth = Math.floor(standartWidth + changeMinCard);
  } else {
    countCards = countCards + 1;
    minCardWidth = gallery.clientWidth / countCards;
  }
  var cards = document.querySelectorAll('.min-card');
  cards.forEach(minCard => {
    minCard.style.width = minCardWidth + 'px';
  });
}

// Изменение позиционирования меню фильтров:

function setFiltersPosition() {
  if (window.innerWidth > 767) {
    if (filters.style.position == 'fixed') {
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

function setFiltersHeight() {
  var scrolled = window.pageYOffset || document.documentElement.scrollTop,
      headerHeight = document.querySelector('.header').clientHeight,
      footerHeight = Math.max((window.innerHeight + scrolled - document.querySelector('.footer').offsetTop) + 20, 0),
      filtersHeight = window.innerHeight - headerHeight - footerHeight;
  filters.style.top = headerHeight + 'px';
  filters.style.maxHeight = filtersHeight + 'px';
}

//=====================================================================================================
// Динамическая смена URL и данных на странице:
//=====================================================================================================

var path;

// Инициализация страницы при открытии сайта:

function initPage() {
  loader.hide();
  setCardTemplate();
  saveCartTotals();
  // !!! НЕТ ПУТИ ДЛЯ ОТДЕЛЬНОЙ СТРАНИЦЫ ТОВАРА
  path = location.search.split('?').map(el => {
    if (el == '') {
      return pageId;
    } else {
      return el;
    }
  });
  renderContent();
}

// Изменение URL без перезагрузки страницы:

window.addEventListener('popstate', (event) => openPage(event));

function openPage(event) {
  event.preventDefault();
  if (event.type == 'popstate') {
    if (event.state) {
      path = event.state.path;
    } else {
      return;
    }
  } else {
    var oldPath = path,
        newUrl = event.currentTarget.dataset.href.split('?');
    path = Array.from(document.querySelector('.header-menu').querySelectorAll('.active'))
      .filter(element => element.dataset.level < event.currentTarget.dataset.level)
      .map(element => element.dataset.href);
    path = path.concat(newUrl);

    if (path.length === oldPath.length && JSON.stringify(oldPath) === JSON.stringify(path)) {
      return;
    }

    var urlPath = path
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
  if (path[path.length - 1].indexOf('=') >= 0) {
    path.pop();
  }
  changeCartInHeader();
  changePageTitle();
  toggleMenuItems();
  createDinamicLinks();
  createMainNav();
  curItems = items;
  if (path[path.length - 1] === 'cart') {
    renderCart();
  } else if (view === 'product') {
    renderProductPage();
  } else {
    renderGallery();
  }
  setPaddingToBody();
  setDocumentScroll(0);
}

// Скрытие неактуальных частей страницы:

function changeContent(block) {
  window.removeEventListener('scroll', scrollGallery);
  window.removeEventListener('resize', scrollGallery);
  if (website === 'skipper') {
    window.removeEventListener('resize', setGalleryWidth);
  } else {
    window.removeEventListener('resize', setMinCardWidth);
  }
  window.removeEventListener('scroll', setFiltersPosition);
  window.removeEventListener('resize', setFiltersPosition);

  if (block === 'cart') {
    hideElement(headerContent);
    showElement(mainHeader);
    hideElement(mainInfo);

    hideElement(content);
    hideElement(filtersContainer);
    hideElement(gallery);
    hideElement(galleryNotice);
  } else {
    showElement(content, 'flex');
    if (block === 'product') {
      showElement(mainHeader);
    }
    if (block === 'gallery') {
      window.addEventListener('scroll', scrollGallery);
      window.addEventListener('resize', scrollGallery);
      if (website === 'skipper') {
        window.addEventListener('resize', setGalleryWidth);
      } else {
        window.addEventListener('resize', setMinCardWidth);
      }
      window.addEventListener('scroll', setFiltersPosition);
      window.addEventListener('resize', setFiltersPosition);
      showElement(headerContent);
      if (website === 'skipper') {
        showElement(mainHeader, 'table');
      } else {
        hideElement(mainHeader);
      }
      showElement(mainInfo, 'flex');
      if (isCart) {
        hideElement(cartContent);
      }
      if (zipSelect) {
        showElement(zipSelect);
        if (website !== 'skipper') {
          if (path[path.length - 1] == 'zip') {
            showElement(zipSelect);
          } else {
            hideElement(zipSelect);
          }
        }
      }
    }
  }
}

// Изменение заголовка страницы:

function changePageTitle() {
  var title = '',
      curTitle = document.querySelector(`[data-href="${path[path.length - 1]}"]`);
  if (view === 'product') {
    title += items[0].title;
  } else if (curTitle) {
    title += curTitle.dataset.title;
  }
  document.title = 'ТОП СПОРТС - ' + title;
  var pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = title;
  }
}

// Изменение активных разделов меню:

function toggleMenuItems() {
  document.querySelectorAll('.header-menu .active').forEach(item => item.classList.remove('active'));
  path.forEach(key => {
    var curTitle = document.querySelector(`.header-menu [data-href="${key}"]`);
    if (curTitle) {
      curTitle.classList.add('active');
    }
  });
}

// Добавление ссылок в разделы меню:

function createDinamicLinks() {
  document.querySelectorAll('.dinamic').forEach(item => {
    var curTitle = document.querySelector(`.header-menu .active[data-level="${item.dataset.level - 1}"]`);
    if (curTitle) {
      item.href = curTitle.href + '?' + item.dataset.href;
    }
  });
}

// Изменение хлебных крошек:

function createMainNav() {
  var list = '',
      curTitle,
      newItem;

  path.forEach(item => {
    curTitle = document.querySelector(`[data-href="${item}"]`);
    if (curTitle) {
      newItem = navItemTemplate
      .replace('#href#', curTitle.href)
      .replace('#dataHref#', item)
      .replace('#level#', curTitle.dataset.level)
      .replace('#title#', curTitle.dataset.title);
      list += newItem;
    }
  });
  if (view === 'product') {
    newItem = navItemTemplate
      .replace('#href#', '#')
      .replace('#title#', items[0].title);
      list += newItem;
  }
  mainNav.innerHTML = mainNavTemplate.replace(navItemTemplate, list);
}

// Создание контента страницы товара:

function renderProductPage() {
  gallery.innerHTML = createCard(items[0]);
  var card = document.querySelector('.product-card');
  document.querySelector(card)
  renderCarousel(card.querySelector('.carousel'))
  .then(
    result => {
      card.style.opacity = '1';
    }
  )
}

// Создание контента галереи:

function renderGallery() {
  var local = location.search,
      pageFilter;
  if (location.search && location.search.indexOf('=') >= 0) {
    local = location.search.split('?');
    pageFilter = local.pop();
    local = local.join('?');
  }
  pageUrl = local ? pageId + local : pageId;
  changeContent('gallery');

  path.forEach(key => {
    if (key != pageId) {
      curItems = curItems.filter(item => item[key] == 1);
    }
  });
  prepareForSearch(curItems);
  clearAllSearch();

  if (zipSelect) {
    initZipFilter('man');
    initOemSearch();
  }
  initFilters(dataFilters);
  if (pageFilter) {
    setFilterOnPage(pageFilter);
  }
  checkFiltersPosition();
  clearFiltersInfo();
  checkFilters();
  if (website === 'skipper') {
    setGalleryWidth();
  } else {
    setMinCardWidth();
  }
  showElement(gallery, 'flex');
}

// Добавление фильтра из поисковой строки:

function setFilterOnPage(filter) {
  var key, value;
  removeInfo('filters');
  removeAllFilters();
  var filterData = decodeURI(filter).toLowerCase().split('=');
  if (filterData[0] === 'manuf_man') {
    filterData[1] = filterData[1].replace('_', ' ');
    manDropDown.setValue(filterData[1]);
  } else {
    menuFilters.querySelectorAll('.filter-item').forEach(el => {
      key = el.dataset.key;
      value = el.dataset.value;
      if (key.toLowerCase() == filterData[0] && value.toLowerCase() == filterData[1]) {
        saveFilter(key, value);
      }
    });
  }
}

// Сброс данных поиска :

function clearSearchResult() {
  selectedItems = '';
  checkFilters();
}

// Очистка всех видов поиска:

function clearAllSearch() {
  selectedItems = '';
  clearPageSearch();
  clearZipFilters();
  clearOemSearch();
}

// Обновление корзины при возвращении на страницу:

function updateCart() {
  getCart()
  .then(
    result => {
      saveCartTotals();
      if (location.search === '?cart') {
        renderCart();
      } else {
        var cards;
        if (view === 'list') {
          cards = document.querySelectorAll('.big-card');
        }
        if (view === 'blocks') {
          cards = document.querySelectorAll('.min-card');
        }
        cards.forEach(card => checkCart(card));
      }
    },
    reject => {
      console.log(reject);
    }
  );
}

//=====================================================================================================
//  Функции для создания фильтров каталога:
//=====================================================================================================

// Отображение фильтров на странице:

function initFilters(dataFilters) {
  var data = JSON.parse(JSON.stringify(dataFilters)),
      isExsist = false;

  for (let item of data) {
    for (let k in item.items) {
      isExsist = curItems.find(card => {
        if (card[item.key] == k || card[k] == 1) {
          return true;
        }
      });
      if (!isExsist) {
        delete item.items[k];
      }
      if (typeof item.items[k] == 'object') {
        for (let kk in item.items[k]) {
          isExsist = curItems.find(card => {
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
  showElement(filtersContainer);
  addTooltips('color');
}

// Создание меню фильтров:

function createFilters(data) {
  return data.map(el => {
    if (document.body.id === '_equip' && !location.search) {
      if (el.key == 'cat') {
        return;
      }
      if (el.key == 'brand') {
        el.isOpen = 'true';
      }
    }
    if (el.items && !isEmptyObj(el.items)) {
      return createFilter(el);
    }
  }).join('');
}

// Создание одного фильтра:

function createFilter(data) {
  var curTitle,
      isHidden,
      newItem = filterTemplate,
      newSubItem,
      list = '',
      subList;

  for (let k in data.items) {
    subList = '';
    isHidden = 'hidden';

    if (typeof data.items[k] === 'object') {
      for (let kk in data.items[k]) {
        if (data.items[k][kk] !== '') {
          isHidden = '';
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

    if (curTitle == 'SpyOptic') {
      curTitle = 'Spy Optic';
    }
    if (curTitle == 'TroyLeeDesigns') {
      curTitle = 'Troy Lee Designs';
    }
    if (curTitle == 'KingDolphin') {
      curTitle = 'King Dolphin';
    }

    newSubItem = filterItemTemplate
      .replace(filterSubitemTemplate, subList)
      .replace('#key#', data.key)
      .replace('#value#', k)
      .replace('#title#', curTitle)
      .replace('#isHidden#', isHidden);
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
//  Функции для работы с фильтрами каталога:
//=====================================================================================================

// Свернуть/развернуть фильтр:

function toggleFilter(event) {
  var curFilter;
  if (event.target.closest('.filter-title')) {
    curFilter = event.currentTarget;
    if (curFilter.classList.contains('close')) {
      curFilter.classList.remove('close');
      saveFilterPosition(curFilter.id, 'open');
    } else {
      curFilter.classList.add('close');
      saveFilterPosition(curFilter.id, 'close');
    }
  }
}

// Свернуть/развернуть подфильтр:

function toggleFilterItem(event) {
  var filterItem = event.currentTarget.closest('.filter-item');
  if (filterItem.classList.contains('disabled')) {
    return;
  }
  filterItem.classList.toggle('close');
}

// Выбор значения фильтра:

function selectFilterValue(event) {
  event.stopPropagation();
  var curEl;
  if (event.currentTarget.classList.contains('result')) {
    if (!event.target.classList.contains('close')) {
      return;
    }
    curEl = menuFilters.querySelector(`[data-key="${event.currentTarget.dataset.key}"][data-value="${event.currentTarget.dataset.value}"]`);
  } else {
    if (!event.target.closest('.filter-item-title') || event.currentTarget.classList.contains('disabled')) {
      return;
    }
    curEl = event.currentTarget;
  }
  getDocumentScroll();
  clearAllSearch();
  var key = curEl.dataset.key,
      value = curEl.dataset.value,
      subkey = curEl.dataset.subkey;

  if (curEl.classList.contains('checked')) {
    curEl.classList.remove('checked');
    curEl.classList.add('close');
    curEl.querySelectorAll('.filter-item.checked').forEach(subItem => subItem.classList.remove('checked'));
    removeFilter(key, value, subkey);
    if (!subkey) {
      deleteDuplicate(key, value);
    }
  } else {
    curEl.classList.add('checked');
    curEl.classList.remove('close');
    var filterItem = curEl.closest('.filter-item.item');
    if (filterItem) {
      filterItem.classList.add('checked');
    }
    saveFilter(key, value, subkey);
    if (!subkey) {
      createDuplicate(key, value, curEl.querySelector('.item-title').textContent);
    }
  }
  var info = getInfo('filters')[pageUrl];
  if (info && isEmptyObj(info)) {
    selectedItems = '';
  } else {
    selectCards(info);
  }
  showCards();
  toggleToActualFilters(event.currentTarget);

  if (window.innerWidth >= 767) {
    if (filters.style.position === 'static') {
      setDocumentScroll();
    }
  } else {
    setDocumentScroll();
  }
}

// Добавление фильтра в информацию о выбранных фильтрах:

function createDuplicate(key, value, title) {
  if (!filtersInfo) {
    return;
  }
  var newEl = duplicateFilterTemplate;
  newEl = newEl
    .replace('#key#', key)
    .replace('#value#', value)
    .replace('#title#', title);
  filtersInfo.insertAdjacentHTML('beforeend', newEl);
  setPaddingToBody();
}

// Удаление фильтра из информации о выбранных фильтрах:

function deleteDuplicate(key, value) {
  if (!filtersInfo) {
    return;
  }
  filtersInfo.querySelector(`[data-key="${key}"][data-value="${value}"]`).remove();
  setPaddingToBody();
}

// Добавление данных в хранилище о выбранных фильтрах:

function saveFilter(key, value, subkey) {
  var info = getInfo('filters');
  if (!info[pageUrl]) {
    info[pageUrl] = {};
  }
  if (!info[pageUrl][key]) {
    info[pageUrl][key] = {};
  }
  if (subkey) {
    if (!info[pageUrl][key][subkey]) {
      info[pageUrl][key][subkey] = {};
    }
    if (!info[pageUrl][key][subkey][value]) {
      info[pageUrl][key][subkey][value] = {};
    }
  } else {
    if (!info[pageUrl][key][value]) {
      info[pageUrl][key][value] = {};
    }
  }
  saveInfo('filters', info);
}

// Удаление данных из хранилища о выбранных фильтрах:

function removeFilter(key, value, subkey) {
  var info = getInfo('filters');
  if (!subkey) {
    delete info[pageUrl][key][value];
    if (isEmptyObj(info[pageUrl][key])) {
      delete info[pageUrl][key];
    }
  } else {
    delete info[pageUrl][key][subkey][value];
    if (info[pageUrl][key][subkey] && isEmptyObj(info[pageUrl][key][subkey])) {
      info[pageUrl][key][subkey] = {};
    }
  }
  saveInfo('filters', info);
}

// Удаление данных из хранилища обо всех фильтрах:

function removeAllFilters() {
  var info = getInfo('filters');
  info[pageUrl] = {};
  saveInfo(`filters`, info);
}

// Сохранение данных в хранилище о состоянии фильтров (открыт/закрыт):

function saveFilterPosition(key, value) {
  var info = getInfo('positions', 'sessionStorage');
  if (!info[pageUrl]) {
    info[pageUrl] = {};
  }
  if (value) {
    info[pageUrl][key] = value;
  }
  saveInfo('positions', info, 'sessionStorage');
}

// Удаление данных из хранилища обо всех состояниях фильтров (открыт/закрыт):

function removeAllFilterPosition() {
  var info = getInfo('positions', 'sessionStorage');
  info[pageUrl] = {};
  saveInfo(`positions`, info, 'sessionStorage');
}

// Отбор карточек фильтром каталога:

function selectCards(info) {
  if (!info) {
    return;
  }
  var isFound;

  selectedItems = curItems.filter(card => {
    for (let k in info) {
      isFound = false;
      for (let kk in info[k]) {
        if (info[k][kk] && !isEmptyObj(info[k][kk])) {
          for (let kkk in info[k][kk]) {
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

// Блокировка неактуальных фильтров:

function toggleToActualFilters(filter) {
  var curItemsArray = curItems;
  if (selectedItems !== '') {
    curItemsArray = selectedItems;
  }
  var curFilters = menuFilters.querySelectorAll(`.filter-item.item.checked[data-key="${filter.dataset.key}"]`),
      checked = menuFilters.querySelectorAll(`.filter-item.item.checked`),
      filterItems;

  if (checked.length == 0) {
    menuFilters.querySelectorAll(`.filter-item.item`).forEach(item => {
      item.classList.remove('disabled');
    });
    return;
  }

  if (curFilters.length != 0) {
    filterItems = menuFilters.querySelectorAll(`.filter-item.item:not([data-key="${filter.dataset.key}"])`);
  } else {
    filterItems = menuFilters.querySelectorAll(`.filter-item.item`);
  }

  var key, value, isExsist, isFound;
  filterItems.forEach(item => {
    isExsist = false;
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
          deleteDuplicate(item.dataset.key, item.dataset.value);
          item.querySelectorAll('.subitem').forEach(subitem => {
            subitem.classList.remove('checked');
          });
          removeFilter(item.dataset.key, item.dataset.value);
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
  });
}

// Очистка фильтров каталога:

function clearFilters() {
  if (!menuFilters.querySelector('.checked')) {
    return;
  }
  getDocumentScroll();
  removeAllFilters();
  removeAllFilterPosition();
  clearFiltersInfo();

  menuFilters.querySelectorAll('.filter-item').forEach(el => {
    el.classList.remove('checked', 'disabled');
    if (el.classList.contains('default-open')) {
      el.classList.remove('close');
    } else {
      el.classList.add('close');
    }
  });

  if (isSearch) {
    return;
  }
  selectedItems = '';
  showCards();
  setDocumentScroll();
}

// Очистка информации о выбранных фильтрах:

function clearFiltersInfo() {
  if (filtersInfo) {
    filtersInfo.innerHTML = '';
  }
}

// Проверка сохраненных положений фильтров:

function checkFiltersPosition() {
  var info = getInfo('positions', 'sessionStorage')[pageUrl],
      curEl;
  if (info) {
    for (let key in info) {
      curEl = document.getElementById(key);
      if (curEl) {
        if (info[key] == 'close') {
          curEl.classList.add('close');
        } else {
          curEl.classList.remove('close');
        }
      }
    }
  }
}

// Проверка сохраненных значений фильтров:

function checkFilters() {
  var info = getInfo('filters')[pageUrl];
  if (info && !isEmptyObj(info)){
    checkFilterExist(info);
    selectFilters(info);
  }
  showCards();
}

// Удаление сохраненных фильтров, если их больше нет на странице:

function checkFilterExist(info) {
  var curEl;
  for (let k in info) {
    for (let kk in info[k]) {
      curEl = menuFilters.querySelector(`[data-key="${k}"][data-value="${kk}"]`);
      if (!curEl) {
        delete info[k][kk];
      }
      for (let kkk in info[k][kk]) {
        curEl = menuFilters.querySelector(`[data-subkey="${kk}"][data-value="${kkk}"]`);
        if (!curEl) {
          delete info[k][kk][kkk];
        }
        if (isEmptyObj(info[k][kk])) {
          delete info[k][kk];
        }
      }
      if (isEmptyObj(info[k])) {
        delete info[k];
      }
    }
  }
}

// Визуальное отображение сохраненных фильтров:

function selectFilters(info) {
  var filters = {},
      filterItem;
  for (let k in info) {
    filters[k] = {};
    filterItem = document.getElementById(`filter-${k}`);
    if (filterItem) {
      filterItem.classList.remove('close');
    }
    for (let kk in info[k]) {
      filters[k][kk] = {};
      selectCards(filters);
      changeFilterClass(k, kk);
      for (let kkk in info[k][kk]) {
        filters[k][kk][kkk] = {};
        selectCards(filters);
        changeFilterClass(k, kkk, kk);
      }
    }
  }
}

// Изменение классов сохраненных фильтров:

function changeFilterClass(key, value, subkey) {
  var curEl;
  if (subkey) {
    curEl = menuFilters.querySelector(`[data-subkey="${subkey}"][data-value="${value}"]`);
  } else {
    curEl = menuFilters.querySelector(`[data-key="${key}"][data-value="${value}"]`);
    createDuplicate(key, value, curEl.querySelector('.item-title').textContent);
  }
  if (curEl) {
    curEl.classList.add('checked');
    var filterItem = curEl.closest('.filter-item');
    if (filterItem) {
      filterItem.classList.remove('close');
    }
    toggleToActualFilters(curEl);
  }
}

//=====================================================================================================
//  Функции для создания фильтров запчастей и поиска по запчастям:
//=====================================================================================================

// Запуск создания фильтров запчастей:

function initZipFilter(filter) {
  createZipFilterData(filter);
  if (zipFilterData[filter].length === 0) {
    if (filter == 'years') {
      initZipFilter('model');
    }
    return;
  }
  createZipFilter(filter);
  unlockZipFilter(filter);
}

// Подготовка данных для фильтров запчастей:

function createZipFilterData(filter) {
  var curItemsArray = curItems;
  if (website === 'skipper') {
    curItemsArray = items;
  }
  if (filter != 'man' && filter != 'oem') {
    curItemsArray = selectedItems;
  }
  zipFilterData[filter] = [];

  curItemsArray.forEach(item => {
    if (item.manuf) {
      for (let k in item.manuf[filter]) {
        if (filter == 'man' || filter == 'oem') {
          if (zipFilterData[filter].indexOf(k.trim()) === -1) {
            zipFilterData[filter].push(k);
          }
        } else {
          for (let kk in item.manuf[filter][k]) {
            if (kk == selectMan.value && zipFilterData[filter].indexOf(k.trim()) === -1) {
              zipFilterData[filter].push(k);
            }
          }
        }
      }
    }
  });
  zipFilterData[filter].sort();
}

// Создание фильтров запчастей:

function createZipFilter(filter) {
  var curSelect = document.getElementById(`select-${filter}`).querySelector('.drop-down');
  fillByTemplate(selectManufItemTemplate, zipFilterData[filter], curSelect);
}

// Создание подсказок в поиске по OEM:

function initOemSearch() {
  createZipFilterData('oem');
  fillByTemplate(oemListTemplate, zipFilterData.oem, oemList);
}

//=====================================================================================================
//  Функции для работы с фильтрами запчастей и поиском по запчастям:
//=====================================================================================================

// Отбор карточек фильтром запчастей:

function selectCardsZipFilter(event) {
  if (isSearch) {
    clearPageSearch();
    clearOemSearch();
  }
  var curItemsArray = curItems;
  if (website === 'skipper') {
    curItemsArray = items;
  }
  var filter = event.currentTarget.dataset.filter,
      isFound;
  selectedItems = curItemsArray.filter(item => {
    if (item.manuf) {
      isFound = false;
      for (let k in item.manuf.man) {
        if (k == selectMan.value) {
          isFound = true;
        }
      }
      if (filter != 'man' && isFound && zipFilterData.years.length != 0) {
        isFound = false;
        for (let k in item.manuf.years) {
          if (k == selectYears.value) {
            for (let kk in item.manuf.years[k]) {
              if (kk == selectMan.value) {
                isFound = true;
              }
            }
          }
        }
      }
      if (filter == 'model' && isFound && zipFilterData.model.length != 0) {
        isFound = false;
        for (let k in item.manuf.model) {
          if (k == selectModel.value) {
            for (let kk in item.manuf.model[k]) {
              if (kk == selectMan.value) {
                isFound = true;
              }
            }
          }
        }
      }
      if (isFound) {
        return true;
      }
    }
  });
  showCards();
  isSearch = true;

  if (filter == 'man') {
    clearZipFilterBtn.classList.add('active');
    lockZipFilter('years');
    lockZipFilter('model');
    initZipFilter('years');
  } else if (filter == 'years') {
    lockZipFilter('model');
    initZipFilter('model');
  }
}

// Блокировка фильтров запчастей:

function lockZipFilter(filter) {
  var curSelect = document.getElementById(`select-${filter}`);
  if (curSelect) {
    window[`${filter}DropDown`].clear();
    curSelect.setAttribute('disabled', 'disabled');
  }
}

// Разблокировка фильтров запчастей:

function unlockZipFilter(filter) {
  var curSelect = document.getElementById(`select-${filter}`);
  if (curSelect) {
    curSelect.removeAttribute('disabled');
  }
}

// Очистка фильтров запчастей:

function startClearZipFilters(btn) {
  if (btn.classList.contains('active')) {
    clearSearchResult();
    clearZipFilters();
  }
}

function clearZipFilters() {
  if (!zipSelect) {
    return;
  }
  isSearch = false;
  clearZipFilterBtn.classList.remove('active');
  manDropDown.clear();
  lockZipFilter('years');
  lockZipFilter('model');
}

// Отображение текущего списка OEM:

function showOemList() {
  var oemToFind = oemSearchInput.value.trim();
  if (oemToFind == '') {
    closeOemHints();
    return;
  }
  showElement(oemDropdown);

  var regExpSearch = RegExp(oemToFind, 'i'),
      allOem = Array.from(document.querySelectorAll('#oem-list .oem'));

  allOem.forEach(el => hideElement(el));
  var curOemList = allOem.filter(el => el.dataset.oem.search(regExpSearch) >= 0);

  if (curOemList.length > 0) {
    showElement(oemList);
    hideElement(oemNotFound);
    curOemList.forEach(el => showElement(el));
  } else {
    hideElement(oemList);
    showElement(oemNotFound);
  }
}

// Выбор OEM из списка:

function selectOem(event) {
  oemSearchInput.value = event.currentTarget.dataset.oem;
  findOem();
}

// Поиск по OEM:

function findOem() {
  event.preventDefault();
  if (isSearch) {
    clearPageSearch();
    clearZipFilters();
  }
  var oemToFind = oemSearchInput.value.trim();
  if (oemToFind == '') {
    return;
  }
  oemSearchInput.dataset.value = oemSearchInput.value;
  selectCardsOemSearch(oemToFind);
  showCards();
  isSearch = true;
  showElement(clearOemSearchBtn);
}

// Отбор карточек по OEM:

function selectCardsOemSearch(oem) {
  selectedItems = curItems.filter(item => {
    if (item.manuf) {
      for (let k in item.manuf.oem) {
        if (k == oem) {
          return true;
        }
      }
    }
  });
}

// Запуск очиски поиска по OEM:

function startClearOemSearch() {
  clearSearchResult();
  clearOemSearch();
}

// Очистка поиска по OEM:

function clearOemSearch() {
  if (!zipSelect) {
    return;
  }
  isSearch = false;
  closeOemHints();
  hideElement(clearOemSearchBtn);
  oemSearchInput.value = '';
  oemSearchInput.dataset.value = '';
}

// Удаление значения из поиска OEM при его фокусе и скрытие подсказок:

function onFocusOemInput(input) {
  onFocusInput(input);
  closeOemHints();
}

// Скрытие подсказок поиска OEM:

function closeOemHints() {
  hideElement(oemDropdown);
  hideElement(oemList);
  hideElement(oemNotFound);
}

function onBlurOemInput(input) {
  setTimeout(() => {
    onBlurInput(input);
    closeOemHints();
  }, 100);
}

//=====================================================================================================
//  Функции для создания галереи:
//=====================================================================================================

// Создание карточек товаров из массива:

var countItems = 0,
    countItemsTo = 0,
    itemsToLoad,
    incr;

function loadCards(cards) {
	if (cards) {
    countItems = 0;
    itemsToLoad = cards;
	} else {
    countItems = countItemsTo;
  }
  if (window.innerWidth > 2000) {
    if (view === 'list') {
      incr = 30;
    } else {
      incr = 60;
    }
  } else if (window.innerWidth < 1080) {
    if (view === 'list') {
      incr = 10;
    } else {
      incr = 20;
    }
  } else {
    if (view === 'list') {
      incr = 20;
    } else {
      incr = 40;
    }
  }
  countItemsTo = countItems + incr;
  if (countItemsTo > itemsToLoad.length) {
    countItemsTo = itemsToLoad.length;
  }

  var list = '', card;
  for (let i = countItems; i < countItemsTo; i++) {
    card = createCard(itemsToLoad[i]);
    list += card;
  }

  if (countItems === 0) {
    gallery.innerHTML = list;
  } else {
    gallery.insertAdjacentHTML('beforeend', list);
  }
  setFiltersPosition();
  if (website === 'skipper') {
    setGalleryWidth();
  } else {
    setMinCardWidth();
  }

  if (view === 'list') {
    document.querySelectorAll('.big-card').forEach(card => {
      renderCarousel(card.querySelector('.carousel'));
      completeCard(card)
    });
  }
  if (view === 'blocks') {
    document.querySelectorAll('.min-card').forEach(card => {
      checkImg(card);
      completeCard(card)
    });
  }
}

// Проверка загружено ли изображение и вставка заглушки при отсутствии изображения:

function checkImg(element) {
  element.querySelector('img').addEventListener('error', (event) => {
    event.currentTarget.src = '../img/no_img.jpg';
  });
}

// Дозаполнение карточки информацией об акции и данными корзины:

function completeCard(card) {
  if (isCart) {
    checkAction(card);
    checkCart(card);
  }
}

// Создание одной карточки товара :

function createCard(data) {
  var newCard = cardTemplate.outerHTML,
      isManuf = data.manuf && Object.keys(data.manuf.man).length > 1 ? true : false,
      template,
      list;

  if (cardTemplate != minCardTemplate) {
    template = cardTemplate.querySelector('.carousel-gallery').innerHTML;
    list = createCarousel(template, data);
    newCard = newCard.replace(template, list);

    template = cardTemplate.querySelector('.card-sizes').innerHTML;
    list = createSizes(template, data);
    newCard = newCard.replace(template, list);

    template = cardTemplate.querySelector('.card-options').innerHTML;
    list = createOptions(template, data, isManuf);
    newCard = newCard.replace(template, list);

    if (isManuf) {
      template = cardTemplate.querySelector('.manuf-row').outerHTML;
      list = createManufTable(template, data.manuf);
      newCard = newCard.replace(template, list);
    }
  }
  newCard = newCard
  .replace('#isAction#', data.actiontitle || data.action_id > 0 ? '' : 'hidden')
  .replace('#isFree#', data.free_qty > 0 ? '' : 'displayNone')
  .replace('#isArrive#', data.arrive_qty > 0 ? '' : 'displayNone')
  .replace('#isWarehouse#', data.warehouse_qty > 0 ? '' : 'displayNone')
  .replace('#isManuf#', isManuf ? '' : 'displayNone')
  .replace('#isDesc#', data.desc ? '' : 'displayNone')

  if (website === 'skipper') {
    newCard = newCard
    .replace('#isHiddenPrice#', data.price_preorder1 > 0 ? '' : 'displayNone')
  } else {
    newCard = newCard
    .replace('#isOldPrice#', data.actiontitle || data.action_id > 0 ? '' : 'hidden')
    .replace('#isBorder#', data.actiontitle || data.action_id > 0 ? '' : 'borderNone')
    .replace('#markup#', ((data.price_user1 - data.price_cur1) / data.price_cur1 * 100).toFixed(0))
  }
  newCard = createElByTemplate(newCard, data);
  return newCard;
}

// Создание карусели:

function createCarousel(template, data, isFull = false) {
  var list = '', newEl;
  for (let i = 0; i < data.images.length; i++) {
    newEl = template;
    if (isFull && window.innerWidth > 400) {
      newEl = newEl.replace('#image#', `http://b2b.topsports.ru/c/source/${data.images[i]}.jpg`);
    } else {
      newEl = newEl.replace('#image#', `http://b2b.topsports.ru/c/productpage/${data.images[i]}.jpg`);
    }
    newEl = newEl.replace('#full-image#', `http://b2b.topsports.ru/c/source/${data.images[i]}.jpg`);
    list += newEl;
  }
  return list;
}

// Создание информации о размерах:

function createSizes(template, data) {
  var list = '', newEl;
  if (data.sizes && data.sizes != 0) {
    for (let key in data.sizes) {
      createSize(data.sizes[key]);
    }
  } else {
    createSize(data);
  }
  function createSize(sizeInfo) {
    newEl = template
    .replace('#isClick#', sizeInfo.size ? '' : 'click')
    .replace('#isFree#', sizeInfo.free_qty > 0 ? '' : 'displayNone')
    .replace('#isArrive#', sizeInfo.arrive_qty > 0 ? '' : 'displayNone')
    .replace('#isWarehouse#', sizeInfo.warehouse_qty > 0 ? '' : 'displayNone');
    newEl = createElByTemplate(newEl, sizeInfo);
    list += newEl;
  }
  return list;
}

// Создание описания опций в карточке товара:

function createOptions(template, data, isManuf) {
  var list = '', newEl;
  if (data.options && data.options != 0) {
    var option;
    for (let key in data.options) {
      option = data.options[key];
      if (key == 32) {
        option = convertYears(data.options[key]);
      } else {
        option = option
          .replace(/\,/gi, ', ')
          .replace(/\//gi, '/ ')
      }
      if ((key == 7 || key == 31 || key == 32 || key == 33) && isManuf) {
        continue;
      } else {
        newEl = template
          .replace('#optitle#', optnames[key])
          .replace('#option#', option);
        list += newEl;
      }
    }
  }
  return list;
}

// Создание таблицы с данными о производителе:

function createManufTable(template, data) {
  var list = '',
      subList,
      newEl,
      subTemplate = cardTemplate.querySelector('.manuf-row').innerHTML,
      titles = Array.from(document.getElementById('manuf-headers').querySelectorAll('div')).map(element => element.dataset.title),
      newCell,
      cell;

  for (let item in data.man) {
    newEl = template;
    subList = '';

    for (let k of titles) {
      newCell = subTemplate;
      cell = [];
      for (let kk in data[k]) {
        if (kk == item) {
          cell.push(kk);
        } else {
          for (let kkk in data[k][kk]) {
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
    newEl = newEl.replace(subTemplate, subList);
    list += newEl;
  }
  return list;
}

// Проверка загруженности всех изображений карусели и отображение карусели:

function renderCarousel(carousel, curImg = 0) {
  return new Promise((resolve, reject) => {
    var imgs = carousel.querySelectorAll('img');

    imgs.forEach((img, index) => {
      if (index === imgs.length - 1) {
        img.addEventListener('load', () => {
          setTimeout(() => render(carousel), 100);
        });
        img.addEventListener('error', () => {
          img.parentElement.remove();
          setTimeout(() => render(carousel), 100);
        });
      } else {
        img.addEventListener('error', () => {
          img.parentElement.remove();
        });
      }
    });

    function render(carousel) {
      if (carousel.querySelectorAll('img').length === 0) {
        carousel.querySelector('.carousel-gallery').insertAdjacentHTML('beforeend', '<div class="carousel-item"><img src="../img/no_img.jpg"></div>');
        startCarouselInit(carousel, curImg);
      }
      startCarouselInit(carousel, curImg);
      resolve('карусель готова');
    }
  });
}

//=====================================================================================================
//  Функции для работы с карточками товаров:
//=====================================================================================================

// Отображение карточек на странице:

function showCards() {
  if (selectedItems === '') {
    showElement(gallery, 'flex');
    hideElement(galleryNotice);
    loadCards(curItems);
  } else {
    if (selectedItems.length == 0) {
      showElement(galleryNotice, 'flex');
      hideElement(gallery);
      setFiltersPosition();
    } else {
      showElement(gallery, 'flex');
      hideElement(galleryNotice);
      loadCards(selectedItems);
    }
  }
}

// Добавление новых карточек при скролле страницы:

function scrollGallery() {
  var scrolled = window.pageYOffset || document.documentElement.scrollTop;
  if (scrolled * 2 + window.innerHeight >= document.body.clientHeight) {
    loadCards();
  }
}

// Переключение вида отображения карточек на странице:

function toggleView(event, newView) {
  if (view != newView) {
    document.querySelector(`.view-${view}`).classList.remove('active');
    event.currentTarget.classList.add('active');
    content.classList.remove(`${view}`);
    content.classList.add(`${newView}`);
    view = newView;
    setCardTemplate();
    gallery.style.opacity = '0'
    showCards();
    gallery.style.opacity = '1'
  }
}

function setCardTemplate() {
  if (view === 'list') {
    cardTemplate = bigCardTemplate;
  }
  if (view === 'blocks') {
    cardTemplate = minCardTemplate;
  }
  if (view === 'product') {
    cardTemplate = productCardTemplate;
  }
}

// Раскрытие в полный размер большой карточки:

function openBigCard(event) {
  var curCard = event.currentTarget.closest('.big-card');
  curCard.classList.toggle('open');
  if (curCard.classList.contains('open')) {
    event.currentTarget.setAttribute('tooltip', 'Свернуть');
  } else {
    event.currentTarget.setAttribute('tooltip', 'Раскрыть');
  }
  setFiltersPosition();
}

// Сворачивание большой карточки:

function closeBigCard(event) {
  var curCard = event.currentTarget.closest('.big-card');
  if (window.innerWidth < 767) {
    if (!(event.target.classList.contains('toggle-btn') || event.target.closest('.carousel') || event.target.closest('.card-size') || event.target.classList.contains('dealer-button'))) {
      curCard.classList.remove('open');
      curCard.querySelector('.toggle-btn').setAttribute('tooltip', 'Раскрыть');
      setFiltersPosition();
    }
  }
}

// Отображение полной карточки товара:

function showFullCard(id) {
  event.preventDefault();
  loader.show();
  openPopUp(fullCardContainer);
  fullCardContainer.style.opacity = 0;
  cardTemplate = fullCardTemplate;
  fullCardContainer.innerHTML = createCard(items.find(item => item.object_id == id));

  completeCard(document.querySelector('.full-card'));

  var curCarousel = fullCardContainer.querySelector('.carousel');
  setCardTemplate();
  renderCarousel(curCarousel)
  .then(
    result => {
      if (curCarousel.querySelector('img').src.indexOf('/no_img.jpg') === -1) {
        curCarousel.querySelector('.carousel-gallery-wrap').addEventListener('click', (event) => showFullImg(event, id));
        curCarousel.querySelector('.maximize').addEventListener('click', (event) => showFullImg(event, id));
      }
    }
  );
  loader.hide();
  fullCardContainer.style.opacity = 1;
}

// Отображение картинки полного размера на экране:

function showFullImg(event, id) {
  if (event.target.classList.contains('control')) {
    return;
  }
  if (fullCardContainer && (!fullCardContainer.style.display || fullCardContainer.style.display === 'none')) {
    getDocumentScroll();
  }
  showElement(fullImgContainer);
  fullImgContainer.style.opacity = 0;
  loader.show();

  var card = curItems.find(item => item.object_id == id),
      list = createCarousel(fullCarouselTemplate, card, true);
  fullImg.innerHTML = fullImgTemplate.replace(fullCarouselTemplate, list);

  var curCarousel = fullImgContainer.querySelector('.carousel'),
      curImg = event.currentTarget.closest('.carousel').dataset.img;

  renderCarousel(curCarousel, curImg)
  .then(
    result => {
      loader.hide();
      fullImgContainer.style.opacity = 1;
    }
  );
  document.body.classList.add('no-scroll');
}

// Скрытие картинки полного размера:

function closeFullImg(event) {
  if (event.target.classList.contains('control')) {
    return;
  }
  loader.hide();
  hideElement(fullImgContainer);
  if (!fullCardContainer.style.display || fullCardContainer.style.display === 'none') {
    document.body.classList.remove('no-scroll');
    setDocumentScroll();
  }
}

//=====================================================================================================
//  Сортировка карточек товаров:
//=====================================================================================================

// Сортировка карточек товаров на странице:

var gallerySort = document.getElementById('gallery-sort');
if (gallerySort) {
  new DropDown(gallerySort);
  gallerySort.addEventListener('change', sortItems);
}

function sortItems() {
  var prop = this.value;
  curItems.sort(dynamicSort(prop));
  if (selectedItems !== '') {
    selectedItems.sort(dynamicSort(prop));
  }
  showCards();
}

//=====================================================================================================
// Поиск на странице:
//=====================================================================================================

// Подготовка данных для поиска на странице:

function prepareForSearch(data) {
  itemsForSearch = JSON.parse(JSON.stringify(data)).map(el => {
    delete el.desc;
    return {object_id: el.object_id, value: convertToString(el)};
  });
}

// Конвертация всей вложенности свойств объекта в строку:

function convertToString(obj) {
  var objProps = '';
  crossObj(obj);
  return objProps;

  function crossObj(obj) {
    var prop;
    for (let k in obj) {
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

function findOnPage(event) {
  event.preventDefault();
  if (isSearch) {
    clearZipFilters();
    clearOemSearch();
  }
  var textToFind = pageSearchInput.value.trim();
  if (textToFind == '') {
    return;
  }
  var regExpSearch = new RegExp(textToFind, 'i');
  selectedItems = [];
  itemsForSearch
    .filter(el => el.value.search(regExpSearch) >= 0)
    .forEach(el => selectedItems.push(curItems.find(item => item.object_id == el.object_id)));
  showCards();
  isSearch = true;
  document.getElementById('search-text').textContent = '"' + textToFind + '"';
  document.getElementById('search-count').textContent = selectedItems.length;
  hideElement(filtersInfo);
  showElement(clearPageSearchBtn);
  showElement(pageSearchInfo, 'flex');
}

// Очистка поиска по странице:

function startClearPageSearch() {
  clearSearchResult();
  clearPageSearch();
}

function clearPageSearch() {
  if (!pageSearch) {
    return;
  }
  isSearch = false;
  pageSearch.classList.remove('open');
  hideElement(clearPageSearchBtn);
  hideElement(pageSearchInfo);
  showElement(filtersInfo, 'flex');
  pageSearchInput.value = '';
}

// Разворачивание поля поиска в шапке сайта:

function openPageSearch() {
  pageSearch.classList.add('open');
}
