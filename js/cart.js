'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var headerCartAmount = headerCart.querySelector('.cart-amount span'),
    headerCartPrice = headerCart.querySelector('.cart-price span'),
    headerCartType = headerCart.querySelector('.cart-type'),
    cart = document.getElementById('cart');

if (cart) {
  var cartFull = document.getElementById('cart-full'),
      cartEmpty = document.getElementById('cart-empty'),
      cartLinks = document.getElementById('cart-links'),
      cartLinksList = document.getElementById('cart-links-list'),
      cartInfo = document.getElementById('cart-info'),
      cartAmount = cartInfo.querySelector('.amount'),
      cartRetailPrice = cartInfo.querySelector('.retail-price'),
      cartOrderPrice = cartInfo.querySelector('.order-price'),
      cartDiscount = cartInfo.querySelector('.cart-discount'),
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

  var cartLinkTemplate = document.getElementById('cart-links-list').innerHTML,
      cartRowTemplate = document.querySelector('.cart-row').outerHTML,
      cartTableRowTemplate = document.querySelector('tr').outerHTML;
}

// Динамически изменяемые переменные:

var cartInfo,
    product,
    curArticul,
    curQty,
    curPrice,
    curRetailPrice,
    curCatalog,
    curType,
    totalAmount,
    totalPrice,
    totalRetailPrice;

//=====================================================================================================
// Первичное отображение корзины в шапке сайта:
//=====================================================================================================

if (headerCart) {
  changeHeaderCart();
}

//=====================================================================================================
// Изменение данных о состоянии корзины:
//=====================================================================================================

// Сохранение/изменение данных о состоянии корзины:

function saveCartInfo(articul, options) {
  cartInfo = getInfo('cart');
  if (options.qty == 0) {
    delete cartInfo[articul];
  } else {
    if (!cartInfo[articul]) {
      cartInfo[articul] = {};
    }
    for (key in options) {
      cartInfo[articul][key] = options[key];
    }
  }
  saveInfo(`cart`, cartInfo);
}

// Удаление данных из корзины:

function removeCartInfo(articul) {
  cartInfo = getInfo('cart');
  delete cartInfo[articul];
  saveInfo(`cart`, cartInfo);
}

//=====================================================================================================
// Функции для работы с информацией о состоянии корзины в шапке сайта:
//=====================================================================================================

// Отображение информации о состоянии корзины в шапке сайта:

var articulPrice;

function changeHeaderCart() {
  cartInfo = getInfo('cart');
  totalAmount = 0;
  totalPrice = 0;
  curCatalog = document.querySelector('.topmenu-item.active');
  curType = '';

  if (curCatalog) {
    curType = curCatalog.textContent;
    headerCartType.textContent = '(' + curType + ')';
  }

  for (key in cartInfo) {
    if (curType) {
      if (cartInfo[key].type == curType) {
        curQty = cartInfo[key].qty;
        curPrice = cartInfo[key].price;
        articulPrice = curQty * curPrice;
        totalAmount += curQty;
        totalPrice += articulPrice;
      }
    } else {
      curQty = cartInfo[key].qty,
      curPrice = cartInfo[key].price,
      articulPrice = curQty * curPrice;
      totalAmount += curQty;
      totalPrice += articulPrice;
    }
  }
  headerCartAmount.textContent = totalAmount;
  headerCartPrice.textContent = convertPrice(totalPrice);
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
  mainInfo.style.display = 'none';
  filtersContainer.style.display = 'none';
  gallery.style.display = 'none';
  galleryNotice.style.display = 'none';

  curCatalog = document.querySelector('.topmenu-item.active');
  changeCatalogLink();

  cartInfo = getInfo('cart');
  if (Object.keys(cartInfo).length == 0) {
    cartEmpty.style.display = 'block';
    cartFull.style.display = 'none';
  } else {
    changeHeaderCart();
    createCartLinks();
    createCartList();
    changeCartInfo();
  }
  cart.style.display = 'block';
}

// Создание сслыки на каталог:

function changeCatalogLink() {
  catalogLink.dataset.href = curCatalog.dataset.href;
  catalogLink.href = curCatalog.href;
}

// Создание ссылок на другие корзины:

var linksList,
    newLink;

function createCartLinks() {
  linksList = '';
  document.querySelectorAll('.topmenu-item:not(.active)').forEach(item => {
    newLink = cartLinkTemplate;
    newLink = newLink
      .replace('#href#', item.href + '?cart')
      .replace('#catalog#', item.dataset.href + '?cart')
      .replace('#type#', item.textContent);
    linksList += newLink;
  });
  if (linksList != '') {
    cartLinksList.innerHTML = linksList;
    cartLinks.style.display = 'flex';
  }
}

// Создание списка товаров корзины:

var cartList,
    cartTableList,
    cartRow,
    cartTableRow;

function createCartList() {
  cartList = '';
  cartTableList = '';
  curType = curCatalog.textContent;
  for (k in cartInfo) {
    if (cartInfo[k].type == curType) {
      product = items.find(item => item.object_id == cartInfo[k].id);
      if (product) {
        if (product.sizes && product.sizes != 0) {
          for (kk in product.sizes) {
            if (product.sizes[kk].articul == k) {
              curArticul = product.sizes[kk];
            }
          }
        } else {
          curArticul = product;
        }
        if (curArticul.articul == k) {
          checkDataRelevance(k, cartInfo[k]);
          cartRow = createCartRow(k, cartInfo[k]);
          cartList += cartRow;
          cartTableRow = createCartTableRow(k, cartInfo[k]);
          cartTableList += cartTableRow;
        } else {
          // если нужно удалить не найденный артикул:
          // removeCartInfo(k);
        }
      }
    }
  }
  if (cartList == '') {
    cartEmpty.style.display = 'block';
    cartFull.style.display = 'none';
  } else {
    cartRows.innerHTML = cartList;
    cartTable.innerHTML = cartTableList;
    checkAllBtn.classList.add('checked');
    cartFull.style.display = 'block';
    cartEmpty.style.display = 'none';
  }
}

// Проверка актуальности корзины:

function checkDataRelevance(articul, options) {
  curQty = parseInt(curArticul.free_qty);
  curPrice = product.price_preorder1 == 0 ? product.price1 : product.price_preorder1;
  if ((options.qty > curQty && curQty > 0) || (options.price != curPrice)) {
    saveCartInfo(articul, {qty: curQty > 0 ? curQty : options.qty, price: curPrice});
    changeHeaderCart();
  }
  cartInfo = getInfo('cart');
}

// Создание одной строки корзины:

var newCartRow,
    productOptions,
    productAvailable;

function createCartRow(articul, options) {
  newCartRow = cartRowTemplate;
  productOptions = '';
  if (options.type == 'экипировка') {
    productOptions = `(${product.options[40]}, ${curArticul.size})`;
  }
  productAvailable = curArticul.free_qty > 0 ? true : false;
  newCartRow = newCartRow
    .replace('#isAvailable#', productAvailable ? '' : 'not-available')
    .replace('#image#', `http://b2b.topsports.ru/c/productpage/${product.images[0]}.jpg`)
    .replace('#title#', product.title)
    .replace('#options#', productOptions)
    .replace('#articul#', articul)
    .replace('#cart-type#', options.type)
    .replace('#price#', productAvailable ? convertPrice(options.price) : 0)
    .replace('#total#', productAvailable ? convertPrice(options.price * options.qty) : 0);
  if (productAvailable) {
    newCartRow = newCartRow
    .replace('#qty#', options.qty)
    .replace('#curPrice#', options.price)
    .replace('#retailPrice#', product.price_user1)
    .replace(/#object_id#/gi, options.id)
    .replace('#qtyTitle#', 'В наличии')
    .replace('#free_qty#', curArticul.free_qty)
  }
  return newCartRow;
}

// Создание одной строки корзины для копирования:

function createCartTableRow(articul, options) {
  newCartRow = cartTableRowTemplate;
  newCartRow = newCartRow
    .replace('#title#', product.title)
    .replace(/#articul#/gi, articul)
    .replace('#qty#', options.qty)
    .replace('#total#', convertPrice(options.price * options.qty))
  return newCartRow;
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


// Изменение информации о выбранном количестве товара и его стоимости в карточке товара:

var curCard,
    curCardSize,
    curInput,
    availableQty;

function changeFromCard(id, sign) {
  curCard = event.currentTarget.closest('.card'),
  curCardSize = event.currentTarget.closest('.card-size'),
  curArticul = curCardSize.querySelector('.size-articul').textContent.replace('Артикул: ', ''),
  curInput = curCardSize.querySelector('.choiced-qty'),
  curQty = parseInt(curInput.value),
  availableQty = parseInt(curCardSize.querySelector('.available-qty').textContent),
  curPrice = parseInt(curInput.dataset.price),
  curType = document.querySelector('.topmenu-item.active').textContent;

  curQty = changeValue(sign, curQty, availableQty);
  curInput.value = curQty;

  saveCartInfo(curArticul, {type: curType, qty: curQty, price: curPrice, id: id});
  changeColors(curCardSize, curQty);
  changeCardInfo(curCard, curPrice);
  changeHeaderCart();
}

// Изменение информации о выбранном количестве товара и его стоимости в корзине:

var curCartRow,
    curQtyBox;

function changeFromCart(id, sign) {
  curCartRow = event.currentTarget.closest('.cart-row');
  curQtyBox = curCartRow.querySelector('.amount');
  curArticul = curCartRow.querySelector('.articul .value').textContent;
  curInput = curQtyBox.querySelector('.choiced-qty');
  curQty = parseInt(curInput.value);
  availableQty = parseInt(curQtyBox.querySelector('.available-qty').textContent);
  curPrice = parseInt(curInput.dataset.price);
  curType = curCartRow.querySelector('.type .value').textContent;
  totalPrice = curCartRow.querySelector('.total .value');

  curQty = changeValue(sign, curQty, availableQty);
  curInput.value = curQty;
  cartTable.querySelector(`.art-${curArticul}`).querySelector('.qty').textContent = curQty;
  totalPrice.textContent = convertPrice(curQty * curPrice);

  saveCartInfo(curArticul, {type: curType, qty: curQty, price: curPrice, id: id});
  changeColors(curQtyBox, curQty);
  changeCartInfo();
  changeHeaderCart();
}

// Изменение количества выбранного товара:

function changeValue(sign, value, qty) {
  if (sign) {
    if (sign == '-') {
      if (value > 0 ) {
        value--;
      }
    }
    if (sign == '+') {
      if (value < qty) {
        value++;
      }
    }
  } else {
    if (isNaN(value)) {
      value = 0;
    }
    if (value > qty) {
      value = qty;
    }
  }
  return value;
}

// Изменение цвета элементов панели выбора товаров:

function changeColors(el, value) {
  if (value == 0) {
    el.classList.remove('in-cart');
  } else {
    el.classList.add('in-cart');
  }
}

// Изменение информации в карточке товара:

var selectInfo;

function changeCardInfo(card, curPrice) {
  selectInfo = card.querySelector('.card-select-info');
  totalAmount = 0;
  totalPrice = 0;
  card.querySelectorAll('.choiced-qty').forEach(size => {
    totalAmount += parseInt(size.value)
  });
  totalPrice = totalAmount * curPrice;

  card.querySelector('.select-count').textContent = totalAmount;
  card.querySelector('.select-price').textContent = convertPrice(totalPrice);

  if (totalAmount != 0) {
    selectInfo.style.visibility = 'visible';
  } else {
    selectInfo.style.visibility = 'hidden';
  }
}

// Изменение информации о корзине:

var checkedCartRows;

function changeCartInfo() {
  checkedCartRows = cartRows.querySelectorAll('.cart-row.checked');
  totalAmount = 0;
  totalPrice = 0;
  totalRetailPrice = 0;

  checkedCartRows.forEach(row => {
    if (!row.classList.contains('not-available')) {
      curInput = row.querySelector('.choiced-qty')
      curQty = parseInt(curInput.value);
      if (curQty > 0) {
        curRetailPrice = parseInt(curInput.dataset.retailPrice);
        curPrice = parseInt(curInput.dataset.price);
        totalAmount += curQty;
        totalRetailPrice += curRetailPrice * curQty;
        totalPrice += curPrice * curQty;
      }
    }
  })

  cartAmount.textContent = totalAmount;
  if (totalAmount > 0) {
    cartRetailPrice.textContent = convertPrice(totalRetailPrice);
    cartOrderPrice.textContent = convertPrice(totalPrice);
    cartDiscountAmount.textContent = '???';
    cartDiscountPercent.textContent = '???';
    cartDiscount.style.display = 'block';
    cartMakeOrder.style.display = 'flex';
  } else {
    cartRetailPrice.textContent = 0;
    cartOrderPrice.textContent = 0;
    cartDiscount.style.display = 'none';
    cartMakeOrder.style.display = 'none';
  }
}

var discounts = [{
  ddatestart: '25.10.2019',
  ddateend: '29.10.2019',
  dtype: 'numplusnum',
  dnv: 5,
  dnvex: 1,
  diart: 'apila',
  diartex: 0,
  dartprice: 0,
  dartexprice: 0,
  dcondition: 0,
  dconditionex: 0
}, {
  ddatestart: '28.10.2019',
  ddateend: '30.10.2019',
  dtype: 'sumlessproc',
  dnv: 200000,
  dnvex: 5,
  diart: 0,
  diartex: 0,
  dartprice: 0,
  dartexprice: 0,
  dcondition: 0,
  dconditionex: 0
}];

// Проверка наличия скидки:

var curDate,
    dateStart,
    dateEnd;

checkDiscount();

function checkDiscount(curArticul, curQty) {
  for (item of discounts) {
    curDate = new Date();
    dateStart = item.ddatestart.split('.');
    dateStart = new Date(dateStart[2], dateStart[1] - 1, dateStart[0], 0, 0, 0, 0);
    dateEnd = item.ddateend.split('.');
    dateEnd = new Date(dateEnd[2], dateEnd[1] - 1, dateEnd[0], 23, 59, 59, 999);
    if (curDate > dateStart && curDate < dateEnd) {
      if (item.dtype == 'numplusnum' || item.dtype == 'numplusart') {
        numPlus(item, 'apila', 20);
      } else if (item.dtype == 'sumlessproc') {
        sumLessProc(item, 201000);
      } else if (item.dtype == 'numkorobkaskidka') {
        numKorobka();
      } else if (item.dtype == 'numupakovka') {
        numUpakovka();
      }
    }
  }
}

var bonus;

function numPlus(discount, curArticul, curQty) {
  console.log('numPlus');
  if (curArticul == discount.diart) {
    bonus = (curQty - (curQty % discount.dnv)) / discount.dnv * discount.dnvex;
    console.log(bonus);
  }
  if (discounts.dtype == 'numplusnum') {
    console.log(discount.diart);
  } else if (discounts.dtype == 'numplusart') {
    console.log(discount.diartex);
  }
}

function sumLessProc(discount, totalAmount) {
  if (totalAmount >= discount.dnv) {
    bonus = totalAmount * discount.dnvex / 100;
    console.log(bonus);
  }
}

function numKorobka(params) {
  
}

function numUpakovka(params) {
  
}

//=====================================================================================================
//  Функции для работы с корзиной:
//=====================================================================================================

// Копирование корзины:

function copyCart() {
  cartCopy.textContent = cartTable.outerHTML;
  cartCopy.select();
  try {
    document.execCommand('copy');
    copyMessage.textContent = 'Содержимое корзины скопировано в буфер обмена.';
    copyResultContainer.style.display = 'flex';
  } catch (error) {
    console.error(error);
    copyMessage.textContent = 'Не удалось скопировать cодержимое корзины.';
    copyResultContainer.style.display = 'flex';
  }
  setTimeout(() => closeCopyResult(), 2000);
}

// Закрытие сообщения о результате копирования корзины:

function closeCopyResult() {
  copyResultContainer.style.display = 'none';
}

// Выделение/снятие выделения всех пунктов корзины:

function toggleAllCart(event) {
  if (event.currentTarget.classList.contains('checked')) {
    event.currentTarget.classList.remove('checked');
    cartRows.querySelectorAll('.cart-row').forEach(row => row.classList.remove('checked'));
    cartMakeOrder.style.display = 'none';
  } else {
    event.currentTarget.classList.add('checked');
    cartRows.querySelectorAll('.cart-row').forEach(row => row.classList.add('checked'));
    cartMakeOrder.style.display = 'flex';
  }
  changeCartInfo();
}

// Выделение/снятие выделения одного пункта корзины:

function toggleInCart(event) {
  event.currentTarget.parentElement.classList.toggle('checked');
  if (!cartRows.querySelector('.cart-row:not(.checked)')) {
    checkAllBtn.classList.add('checked');
  } else {
    checkAllBtn.classList.remove('checked');
  }
  changeCartInfo();
}

// Удаление выбранных пунктов:

function deleteSelected() {
  cartRows.querySelectorAll('.cart-row.checked').forEach(row => {
    cartRows.removeChild(row);
    removeCartInfo(row.querySelector('.articul .value').textContent);
  });
  checkAllBtn.classList.remove('checked');
  changeCartInfo();
  changeHeaderCart();
  if (cartRows.querySelectorAll('.cart-row').length == 0) {
    cartEmpty.style.display = 'block';
    cartFull.style.display = 'none';
  }
}
