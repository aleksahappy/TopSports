'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var headerAmount = headerCart.querySelector('.amount span'),
    headerPrice = headerCart.querySelector('.price span'),
    headerShortAmount = headerCart.querySelector('.short-amount'),
    headerCartName = headerCart.querySelector('.name'),
    cart = document.getElementById('cart');

if (cart) {
  var cartFull = document.getElementById('cart-full'),
      cartEmpty = document.getElementById('cart-empty'),
      cartLinks = document.getElementById('cart-links'),
      cartLinksList = document.getElementById('cart-links-list'),
      cartFilter = document.getElementById('cart-filter'),
      filterSelect = document.getElementById('filter-select'),
      filterAll = document.getElementById('filter-all'),
      cartInform = document.getElementById('cart-info'),
      cartAmount = cartInform.querySelector('.amount'),
      cartRetailPrice = cartInform.querySelector('.retail-price'),
      cartOrderPrice = cartInform.querySelector('.order-price'),
      cartDiscount = cartInform.querySelector('.cart-discount'),
      cartDiscountAmount = cartDiscount.querySelector('.discount-amount'),
      cartDiscountPercent = cartDiscount.querySelector('.discount-percent'),
      cartMakeOrder = cart.querySelector('.cart-make-order'),
      orderForm = document.getElementById('order-form'),
      paymentSelect = document.getElementById('payment-select'),
      partnerSelect = document.getElementById('partner-select'),
      deliverySelect = document.getElementById('delivery-select'),
      addressSelect = document.getElementById('address-select'),
      comment = document.getElementById('comment'),
      commentCounter = document.getElementById('comment-counter'),
      orderInfo = document.getElementById('order-info'),
      orderNames = document.getElementById('order-names'),
      copyResultContainer = document.getElementById('copy-result-container'),
      copyMessage = document.getElementById('copy-message'),
      checkAllBtn = document.getElementById('check-all'),
      cartRows = document.getElementById('cart-rows'),
      cartTable = document.getElementById('cart-table'),
      cartCopy = document.getElementById('cart-copy'),
      catalogLink = document.getElementById('catalog-link');

  // Получение шаблонов из HTML:

  var cartLinkTemplate = cartLinksList.innerHTML,
      filterSelectTemplate = filterSelect.innerHTML,
      cartFilterTemplate =  filterSelect.querySelector('.filter-value').outerHTML,
      cartRowTemplate = cartRows.innerHTML,
      cartTableRowTemplate = cartTable.querySelector('tr').outerHTML;
}

// Динамически изменяемые переменные:

var cartInfo,
    product,
    curArticul,
    curId,
    curQty,
    curPrice,
    curRetailPrice,
    totalAmount,
    totalPrice,
    totalRetailPrice,
    totalBonus,
    discount,
    bonus;

//=====================================================================================================
// Изменение данных о состоянии корзины:
//=====================================================================================================

// Сохранение/изменение данных о состоянии корзины:

function saveCartInfo(id, qty) {
  id = '#' + id;
  cartInfo = getInfo('cart');
  if (!cartInfo[sectionId]) {
    cartInfo[sectionId] = {};
  }
  if (qty == 0) {
    delete cartInfo[sectionId][id];
  } else {
    cartInfo[sectionId][id] = qty;
  }
  saveInfo(`cart`, cartInfo);
}

// Удаление данных из корзины:

function removeCartInfo(id) {
  id = '#' + id;
  cartInfo = getInfo('cart');
  delete cartInfo[sectionId][id];
  saveInfo(`cart`, cartInfo);
}

//=====================================================================================================
// Функции для работы с информацией о состоянии корзины в шапке сайта:
//=====================================================================================================

// Отображение информации о состоянии корзины в шапке сайта:

function changeHeaderCart() {
  cartInfo = getInfo('cart')[sectionId];
  totalAmount = 0;
  totalPrice = 0;
  if (headerCartName) {
    headerCartName.textContent = '(' + document.querySelector('.topmenu-item.active').textContent + ')';
  }

  for (key in cartInfo) {
    qty = cartInfo[key];
    key = key.replace('#', '');
    findCurData(key);
    if (product) {
      totalAmount += qty;
      discount = checkDiscount(key, qty);
      if (discount && discount.price) {
        totalPrice += discount.price;
      } else {
        totalPrice += qty * curPrice;
      }
    }
  }
  headerAmount.textContent = totalAmount;
  headerPrice.textContent = totalPrice.toLocaleString();
  if (totalAmount == 0) {
    headerShortAmount.style.visibility = 'hidden';
  } else {
    headerShortAmount.style.visibility = 'visible';
    if (totalAmount > 99) {
      headerShortAmount.textContent = '99+';
    } else {
      headerShortAmount.textContent = totalAmount;
    }
  }
}

//=====================================================================================================
// Функции для отображения контента корзины:
//=====================================================================================================

// Отображение контента корзины:

function renderCart() {
  window.removeEventListener('scroll', scrollGallery);
  window.removeEventListener('resize', scrollGallery);

  submenu.style.display = 'none';
  search.style.visibility = 'hidden';
  mainMenuBtns.style.visibility = 'hidden';
  mainInfo.style.display = 'none';
  filtersContainer.style.display = 'none';
  gallery.style.display = 'none';
  galleryNotice.style.display = 'none';
  createCatalogLink();
  changeHeaderCart();
  // checkDataRelevance();
  if (createCartList()) {
    checkAllBtn.classList.add('checked');
    createCartLinks();
    createCartFilters();
    document.querySelectorAll('.cart-row').forEach(row => {
      findCurData(row.dataset.id);
      changeCartRow(row);
    });
    changeCartInfo();
    cartFull.style.display = 'block';
    cartEmpty.style.display = 'none';
  }
  cart.style.display = 'block';
}

// Создание сслыки на каталог:

var curCatalog;

function createCatalogLink() {
  curCatalog = document.querySelector('.topmenu-item.active');
  catalogLink.dataset.href = curCatalog.dataset.href;
  catalogLink.href = curCatalog.href;
}

// Проверка актуальности корзины:

// function checkDataRelevance(articul, info) {
//   curQty = parseInt(curArticul.free_qty, 10);
//   curPrice = product.price_preorder1 > 0 ? product.price_preorder1 : product.price1;
//   if ((info.qty > curQty && curQty > 0) || (info.price != curPrice)) {
//     saveCartInfo(articul, {qty: curQty > 0 ? curQty : info.qty, price: curPrice});
//     changeHeaderCart();
//   }
// }

// Создание ссылок на другие корзины:

function createCartLinks() {
  list = '';
  document.querySelectorAll('.topmenu-item:not(.active)').forEach(item => {
    newItem = cartLinkTemplate
      .replace('#href#', item.href + '?cart')
      .replace('#dataHref#', item.dataset.href + '?cart')
      .replace('#title#', item.textContent);
      list += newItem;
  });
  if (list != '') {
    cartLinksList.innerHTML = list;
    cartLinks.style.display = 'flex';
  }
}

// Создание фильтров корзины:

var unique;

function createCartFilters() {
  list = '';
  unique = [];
  for (item of discounts) {
    if (item.dtitle && unique.indexOf(item.did) === -1) {
      unique.push(item.did);
      newItem = cartFilterTemplate
        .replace('#actionId#', item.did)
        .replace('#actionTitle#', item.dtitle);
      list += newItem;
    }
  }
  filterSelect.innerHTML = filterSelectTemplate.replace(cartFilterTemplate, list);
  cartFilter.style.display = 'flex';
}

// Создание списка товаров корзины:

var cartList,
    cartTableList;

function createCartList() {
  cartList = '';
  cartTableList = '';
  cartInfo = getInfo('cart')[sectionId];
  for (key in cartInfo) {
    qty = cartInfo[key];
    key = key.replace('#', '');
    findCurData(key);
    if (product) {
      newItem = createCartRow(qty);
      cartList += newItem;
      newItem = createCartTableRow(qty);
      cartTableList += newItem;
    } else {
      // если нужно удалить не найденный артикул:
      removeCartInfo(key);
    }
  }
  if (!cartList) {
    cartEmpty.style.display = 'block';
    cartFull.style.display = 'none';
  } else {
    cartRows.innerHTML = cartList;
    cartTable.innerHTML = cartTableList;
  }
  return cartList;
}

// Получение данных о текущем артикле:

function findCurData(id) {
  curArticul = null;
  product = items.find(item => {
    if (item.sizes && item.sizes != 0) {
      for (key in item.sizes) {
        if (item.sizes[key].object_id == id) {
          curArticul = item.sizes[key];
          return true;
        }
      }
    } else {
      if (item.object_id == id) {
        curArticul = item;
        return true;
      }
    }
  });
  if (product) {
    curPrice = product.price_preorder1 == 0 ? product.price1 : product.price_preorder1;
    curRetailPrice = product.price_user1;
  }
}

// Создание одной строки корзины:

var productOptions,
    productStatus;

function createCartRow(qty, isBonus) {
  newItem = cartRowTemplate;
  productOptions = '';
  if (product.sizes && Object.keys(product.sizes).length > 1) {
    productOptions = `(${product.options[40]}, ${curArticul.size})`;
  }
  productStatus = '';
  if (curArticul.free_qty <= 0) {
    productStatus = 'not-available';
  }
  if (isBonus) {
    productStatus = 'bonus';
  }

  newItem = newItem
    .replace('#status#', productStatus)
    .replace(/#id#/gi, curArticul.object_id)
    .replace('#image#', `http://b2b.topsports.ru/c/productpage/${product.images[0]}.jpg`)
    .replace('#title#', product.title)
    .replace('#options#', productOptions)
    .replace('#articul#', curArticul.articul)

  if (isBonus) {
    newItem = newItem
      .replace('#bonus#', qty)
      .replace('#price#', 'Подарок');
  } else if (productStatus === 'not-available') {
    newItem = newItem
      .replace('#price#', '0');
  } else {
    newItem = newItem
      .replace('#qty#', qty)
      .replace('#price#', curPrice.toLocaleString())
      .replace('#free_qty#', curArticul.free_qty);
  }
  return newItem;
}

// Создание одной строки корзины для копирования:

function createCartTableRow(qty) {
  newItem = cartTableRowTemplate
    .replace('#id#', curArticul.object_id)
    .replace('#title#', product.title)
    .replace('#articul#', curArticul.articul)
    .replace('#qty#', qty);
  return newItem;
}

//=====================================================================================================
//  Функции для изменения количества товаров:
//=====================================================================================================

// Удаление значения из инпута при его фокусе:

function onFocusInput(input) {
  if (input.value != '') {
    input.value = '';
  }
}

// Запрет на ввод в инпут любого значения кроме цифр:

var chr;

function checkValue(event) {
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  chr = getChar(event);
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

// Вывод информации о корзине:

var curQtyBox,
    freeQty;

function checkCart(card) {
  for (key in cartInfo) {
    qty = cartInfo[key];
    key = key.replace('#', '');
    curEl = card.querySelector(`[data-id="${key}"]`);
    if (curEl) {
      curQtyBox = curEl.closest('.card-size');
      freeQty = parseInt(curQtyBox.querySelector('.available-qty').textContent, 10);
      curQty = qty;
      curEl.value = curQty > freeQty ? freeQty : curQty;
      changeColors(curQtyBox, curQty);
      findCurData(key);
      changeCardInfo(card);
    }
  }
}

// Изменение информации о корзине:

var curInput;

function changeCart(event, id, sign) {
  curEl = event.currentTarget.closest('.card');
  if (curEl) {
    curQtyBox = event.currentTarget.closest('.card-size');
  } else {
    curEl = event.currentTarget.closest('.cart-row');
    curQtyBox = curEl.querySelector('.amount');
  }
  curInput = curQtyBox.querySelector('.choiced-qty');
  curQty = parseInt(curInput.value, 10);
  freeQty = parseInt(curQtyBox.querySelector('.available-qty').textContent, 10);

  curQty = changeValue(sign, curQty, freeQty);
  if (curInput.value === curQty) {
    return;
  }
  curInput.value = curQty;

  saveCartInfo(id, curQty);
  changeColors(curQtyBox, curQty);

  findCurData(id);
  if (curEl.classList.contains('card')) {
    changeCardInfo(curEl);
  } else {
    changeCartRow(curEl);
    changeCartInfo();
  }
  changeHeaderCart();
}

// Изменение количества выбранного товара:

function changeValue(sign, qty, freeQty) {
  if (sign) {
    if (sign == '-') {
      if (qty > 0) {
        qty--;
      }
    } else if (sign == '+') {
      if (qty < freeQty) {
        qty++;
      }
    } else if (sign == 'В корзину') {
      qty = 1;
    } else if (sign == 'Удалить') {
      qty = 0;
    }
  } else {
    if (isNaN(qty)) {
      qty = 0;
    }
    if (qty > freeQty) {
      qty = freeQty;
    }
  }
  return qty;
}

// Изменение цвета элементов панели выбора:

function changeColors(el, qty) {
  if (qty == 0) {
    el.classList.remove('in-cart');
  } else {
    el.classList.add('in-cart');
  }
}

// Изменение информации в карточке товара:

var selectInfo,
    curName;

function changeCardInfo(card) {
  selectInfo = card.querySelector('.select-info');
  bonus = selectInfo.querySelector('.bonus');
  totalAmount = 0;
  totalPrice = 0;
  totalBonus = 0;

  card.querySelectorAll('.card-size').forEach(size => {
    curName = size.querySelector('.size-name.click');
    curInput = size.querySelector('.choiced-qty');
    curQty = parseInt(curInput.value, 10);

    if (curQty > 0) {
      if (curName) {
        curName.textContent = 'Удалить';
      }
      totalAmount += curQty;

      discount = checkDiscount(curInput.dataset.id, curQty);

      if (!discount) {
        totalPrice += curQty * curPrice;
      } else {
        if (discount.price) {
          totalPrice += discount.price;
        } else {
          totalPrice += curQty * curPrice;
        }
        if (discount.bonus >= 0) {
          if (discount.bonus > 0 ) {
            findCurData(discount.articul);
            totalBonus += discount.bonus;
            bonus.querySelector('.bonus-img').src = `http://b2b.topsports.ru/c/productpage/${product.images[0]}.jpg`;
            bonus.style.display = 'flex';
          } else {
            bonus.style.display = 'none';
          }
        }
      }
    } else {
      if (curName) {
        curName.textContent = 'В корзину';
        bonus.style.display = 'none';
      }
    }
  });

  if (totalAmount > 0) {
    card.querySelector('.select-count').textContent = totalAmount;
    card.querySelector('.select-price').textContent = totalPrice.toLocaleString();
    bonus.querySelector('.bonus-qty span').textContent = totalBonus;
    selectInfo.style.visibility = 'visible';
  } else {
    selectInfo.style.visibility = 'hidden';
  }
}

// Изменение информации в корзине:

var tableRow,
    cartRow,
    cartTableRow,
    bonusRow;

function changeCartRow(row) {
  if (row.classList.contains('not-available')) {
    return;
  }
  curId = row.dataset.id;
  curQty = parseInt(row.querySelector('.choiced-qty').value ,10);
  tableRow = cartTable.querySelector(`:not(.bonus)[data-id="${curId}"]`);

  row.dataset.retailPrice = curQty * curRetailPrice;
  tableRow.querySelector('.qty').textContent = curQty;
  totalPrice = 0;

  discount = checkDiscount(curId, curQty);

  if (!discount) {
    totalPrice = curQty * curPrice;
    filterSelect.querySelector(`[value="no-action"]`).style.display = 'block';
  } else {
    row.dataset.action = discount.id;
    row.classList.add('discount');
    filterSelect.querySelector(`.filter-value[value="${discount.id}"]`).style.display = 'block';
    row.querySelector('.action .value').textContent = discount.title;
    if (discount.price) {
      totalPrice = discount.price;
    } else {
      totalPrice = curQty * curPrice;
    }
    if (discount.bonus >= 0) {
      bonusRow = document.querySelector(`.cart-row.bonus[data-id="${discount.articul}"]`);
      if (discount.bonus > 0) {
        if (bonusRow) {
          bonusRow.querySelector('.amount .bonus span').textContent = discount.bonus;
          cartTable.querySelector(`[data-id="${discount.articul}"] .qty`).textContent = discount.bonus;
        } else {
          findCurData(discount.articul);
          cartRow = createCartRow(discount.bonus, true);
          row.insertAdjacentHTML('afterend', cartRow);
          bonusRow = row.nextElementSibling;
          bonusRow.dataset.parentId = curId;
          bonusRow.dataset.action = discount.id;
          bonusRow.querySelector('.action .value').textContent = discount.title;
          if (!row.classList.contains('checked')) {
            bonusRow.classList.remove('checked');
          }
          cartTableRow = createCartTableRow(discount.bonus);
          tableRow.insertAdjacentHTML('afterend', cartTableRow);
          tableRow.nextElementSibling.classList.add('bonus');
        }
      } else {
        if (bonusRow) {
          cartRows.removeChild(bonusRow);
          cartTable.firstChild.removeChild(cartTable.querySelector(`.bonus[data-id="${bonusRow.dataset.id}"]`));
        }
      }
    }
  }

  row.querySelector('.total .value').textContent = totalPrice.toLocaleString();
  row.dataset.price = totalPrice;
  tableRow.querySelector('.total').textContent = totalPrice;
}

// Изменение общей информации о корзине:

var selectedRows;

function changeCartInfo() {
  selectedRows = cartRows.querySelectorAll('.cart-row.checked:not(.bonus)');
  if (!selectedRows) {
    return;
  }
  totalAmount = 0;
  totalPrice = 0;
  totalRetailPrice = 0;

  selectedRows.forEach(row => {
    if (!row.classList.contains('not-available')) {
      curQty = parseInt(row.querySelector('.choiced-qty').value, 10);
      if (curQty > 0) {
        totalAmount += curQty;
        totalPrice += parseInt(row.dataset.price, 10);
        totalRetailPrice += parseInt(row.dataset.retailPrice, 10);
      }
    }
  });

  cartAmount.textContent = totalAmount;
  if (totalAmount > 0) {
    cartOrderPrice.textContent = totalPrice.toLocaleString();
    cartRetailPrice.textContent = totalRetailPrice.toLocaleString();
    discount = checkOrderDiscount(selectedRows);
    if (discount) {
      cartDiscountAmount.textContent = discount.price.toLocaleString();
      cartDiscountPercent.textContent = discount.percent;
      cartDiscount.style.display = 'block';
    } else {
      cartDiscount.style.display = 'none';
    }
    cartMakeOrder.style.display = 'flex';
  } else {
    cartOrderPrice.textContent = 0;
    cartRetailPrice.textContent = 0;
    cartDiscount.style.display = 'none';
    cartMakeOrder.style.display = 'none';
  }
}

//=====================================================================================================
//  Функции для подсчета скидок:
//=====================================================================================================

var curDiscount,
    relevance,
    result;

// Проверка актуальности скидки:

var curDate,
    dateStart,
    dateEnd;

function checkDiscountDate(discount) {
  if (!discount.ddatestart || !discount.ddateend) {
    return true;
  }
  curDate = new Date();
  dateStart = discount.ddatestart.split('.');
  dateStart = new Date(dateStart[2], dateStart[1] - 1, dateStart[0], 0, 0, 0, 0);
  dateEnd = discount.ddateend.split('.');
  dateEnd = new Date(dateEnd[2], dateEnd[1] - 1, dateEnd[0], 23, 59, 59, 999);
  if (curDate > dateStart && curDate < dateEnd) {
    return true;
  } else {
    return false;
  }
}

// Проверка скидки на артикул:

function checkDiscount(id, qty) {
  curDiscount = discounts.find(item => {
    if (item.diart) {
      for (curId of item.diart) {
        return curId == id ? true : false;
      }
    }
  });
  if (!curDiscount) {
    return undefined;
  }
  relevance = checkDiscountDate(curDiscount);
  if (relevance) {
    result = {};
    result.id = curDiscount.did;
    result.title = curDiscount.dtitle;
    result.descr = curDiscount.ddesc;
    switch (curDiscount.dtype) {
      case 'numplusnum':
        numPlusNum(curDiscount, qty);
        break;
      case 'numplusart':
        numPlusArt(curDiscount, qty);
        break;
      case 'numminusproc':
        numMinusProc(curDiscount, qty);
        break;
      case 'numkorobkaskidka':
        numKorobka();
        break;
      case 'numupakovka':
        numUpakovka();
        break;
    }
    return result;
  } else {
    return undefined;
  }
}

// Расчет скидки "покупаешь определенное кол-во - из него определенное кол-во в подарок":

function numPlusNum(discount, qty) {
  result.price = (qty - findBonus(discount, qty)) * curPrice;
}

// Расчет скидки "покупаешь определенное кол-во - определенное кол-во другого артикула в подарок":

function numPlusArt(discount, qty) {
  result.bonus = findBonus(discount, qty);
  result.articul = discount.diartex;
}

// Расчет количества бонусов:

function findBonus(discount, qty) {
  return Math.floor(qty / discount.dnv) * discount.dnvex;
}

// Расчет скидки "покупаешь определенное кол-во - скидка в % от РРЦ":

var rest;

function numMinusProc(discount, qty) {
  rest = qty % discount.dnv;
  result.price = (qty - rest) * (curRetailPrice - curRetailPrice * discount.dnvex / 100) + (rest * curPrice);
}

// Расчет скидки типа "скидка при покупке коробки":

function numKorobka(params) {
}

// Расчет скидки типа "скидка при покупке упаковки":

function numUpakovka(params) {
}

// Проверка скидки на заказ:

var sum;

function checkOrderDiscount(selectedRows) {
  curDiscount = discounts.find(item => !item.diart && item.dcondition.razdel == sectionId);
  if (!curDiscount) {
    return undefined;
  }
  relevance = checkDiscountDate(curDiscount);
  if (relevance) {
    countSum(selectedRows);
    if (sum > 0) {
      switch (curDiscount.dtype) {
        case 'sumlessproc':
          return sumLessProc(curDiscount, sum);
      }
    }
  }
}

// Нахождение общей суммы:

function countSum(selectedRows) {
  sum = 0;
  if (selectedRows) {
    selectedRows.forEach(row => {
      if (!row.dataset.action) {
        sum += parseInt(row.dataset.retailPrice, 10);
      }
    });
  } else {
    cartInfo = getInfo('cart')[sectionId];
    for (key in cartInfo) {
      qty = cartInfo[key];
      key = key.replace('#', '');
      discount = checkDiscount(key, qty);
      if (!discount) {
        findCurData(key);
        sum += qty * curRetailPrice;
      }
    }
  }
}

// Расчет скидки "итоговая сумма заказа минус %":

var current;

function sumLessProc(discount, sum) {
  current = undefined;
  discount.dnv.forEach((item, index) => {
    if (sum >= item) {
      current = index;
    }
  });
  if (current >= 0) {
    result = {};
    result.price = sum * discount.dnvex[current] / 100;
    result.percent = discount.dnvex[current];
    return result;
  } else {
    return undefined;
  }
}

//=====================================================================================================
//  Функции для работы с корзиной:
//=====================================================================================================

var allRows;

// Фильтрация корзины:

var selectedValue;

function filterCart() {
  selectedValue = filterSelect.value;
  allRows = cartRows.querySelectorAll('.cart-row');
  if (selectedValue === 'all') {
    allRows.forEach(row => {
      row.classList.add('checked');
      row.classList.remove('displayNone');
    });
  } else if (selectedValue === 'no-action') {
    allRows.forEach(row => {
      if (!row.dataset.action) {
        row.classList.add('checked');
        row.classList.remove('displayNone');
      } else {
        row.classList.remove('checked');
        row.classList.add('displayNone');
      }
    });
  } else {
    allRows.forEach(row => {
      if (row.dataset.action === selectedValue) {
        row.classList.add('checked');
        row.classList.remove('displayNone');
      } else {
        row.classList.remove('checked');
        row.classList.add('displayNone');
      }
    });
  }
  checkAllBtn.classList.add('checked');
  changeCartInfo();
}

// Копирование корзины:

function copyCart() {
  cartCopy.textContent = cartTable.outerHTML;
  cartCopy.focus();
  cartCopy.setSelectionRange(0, cartCopy.value.length);
  try {
    document.execCommand('copy');
    alert('Содержимое корзины скопировано в буфер обмена.');
    // copyMessage.textContent = 'Содержимое корзины скопировано в буфер обмена.';
    // copyResultContainer.style.display = 'flex';
  } catch (error) {
    console.error(error);
    alert('Не удалось скопировать cодержимое корзины.');
    // copyMessage.textContent = 'Не удалось скопировать cодержимое корзины.';
    // copyResultContainer.style.display = 'flex';
  }
  // setTimeout(() => closeCopyResult(), 2000);
}

// Закрытие сообщения о результате копирования корзины:

function closeCopyResult() {
  copyResultContainer.style.display = 'none';
}

// Выделение/снятие выделения всех пунктов корзины:

function toggleAllCart(event) {
  if (event.currentTarget.classList.contains('checked')) {
    event.currentTarget.classList.remove('checked');
    cartRows.querySelectorAll('.cart-row:not(.displayNone)').forEach(row => row.classList.remove('checked'));
    cartMakeOrder.style.display = 'none';
  } else {
    event.currentTarget.classList.add('checked');
    cartRows.querySelectorAll('.cart-row:not(.displayNone)').forEach(row => row.classList.add('checked'));
    cartMakeOrder.style.display = 'flex';
  }
  changeCartInfo();
}

// Выделение/снятие выделения одного пункта корзины:

var curRow,
    curTableRow;

function toggleInCart(event) {
  curRow = event.currentTarget.parentElement;
  if (curRow.classList.contains('bonus')) {
    return;
  }
  curRow.classList.toggle('checked');
  bonusRow = document.querySelector(`.cart-row[data-parent-id="${curRow.dataset.id}"]`);
  if (bonusRow) {
    bonusRow.classList.toggle('checked');
  }
  if (!cartRows.querySelector('.cart-row:not(.checked)')) {
    checkAllBtn.classList.add('checked');
  } else {
    checkAllBtn.classList.remove('checked');
  }
  changeCartInfo();
}

// Удаление выбранных пунктов:

var curAction;

function deleteSelected() {
  if (confirm('Удалить выделенные товары из корзины?')) {
    cartRows.querySelectorAll('.cart-row.checked').forEach(row => {
      cartRows.removeChild(row);
      curAction = row.dataset.action;
      if (curAction) {
        if (!cartRows.querySelector(`.cart-row.discount[data-action="${curAction}"]`)) {
          filterSelect.querySelector(`[value="${curAction}"]`).style.display = 'none';
        }
      } else {
        if (!cartRows.querySelector('.cart-row:not(.discount)')) {
          filterSelect.querySelector('[value="no-action"]').style.display = 'none';
        }
      }
      if (row.classList.contains('bonus')) {
        cartTable.firstChild.removeChild(cartTable.querySelector(`.bonus[data-id="${row.dataset.id}"]`));
      } else {
        cartTable.firstChild.removeChild(cartTable.querySelector(`[data-id="${row.dataset.id}"]`));
        removeCartInfo(row.dataset.id);
      }
    });
    checkAllBtn.classList.remove('checked');
    changeCartInfo();
    changeHeaderCart();
    if (cartRows.querySelectorAll('.cart-row').length == 0) {
      cartEmpty.style.display = 'block';
      cartFull.style.display = 'none';
    } else {
      if (!cartRows.querySelector('.cart-row:not(.displayNone)')) {
        filterSelect.value = 'all';
        filterCart();
      }
    }
  }
}
