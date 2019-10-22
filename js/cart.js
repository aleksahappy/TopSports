'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var headerCartAmount = document.querySelector('#header-cart .cart-amount span'),
    headerCartPrice = document.querySelector('#header-cart .cart-price span'),
    cart = document.getElementById('cart'),
    cartSort = document.getElementById('sort-select'),
    cartInfo = document.getElementById('cart-info');
    // cartAmount = cartInfo.querySelector('.cart-amount'),
    // cartRetailPrice = cartInfo.querySelector('.retail-price'),
    // cartOrderPrice = cartInfo.querySelector('.order-price'),
    // cartDiscountAmount = cartInfo.querySelector('.discount-amount'),
    // cartDiscountPercent = cartInfo.querySelector('.discount-percent'),
    // orderForm = document.getElementById('order-form'),
    // paymentSelect = document.getElementById('payment-select'),
    // partnerSelect = document.getElementById('partner-select'),
    // deliverySelect = document.getElementById('delivery-select'),
    // addressSelect = document.getElementById('address-select'),
    // comment = document.getElementById('comment'),
    // commentCounter = document.getElementById('comment-counter'),
    // orderInfo = document.getElementById('order-info'),
    // orderNames = document.getElementById('order-names'),
    // cartRows = document.getElementById('cart-rows'),
    // cartTable = document.getElementById('cart-table'),
    // cartCopy = document.getElementById('cart-copy');

// Получение шаблонов из HTML:

// var cartRowTemplate = cartRows.querySelector('.cart-row').outerHTML,
//     cartTableRowTemplate = cartTable.querySelector('tr').outerHTML;


// Динамически изменяемые переменные:

var cartInfo;

//=====================================================================================================
// Заполнение контента страницы:
//=====================================================================================================

if (isCart) {
  renderHeaderCart();
}

//=====================================================================================================
// Функции для работы с информацией о состоянии корзины в шапке сайта:
//=====================================================================================================

// Отображение информации о состоянии корзины в шапке сайта:

function renderHeaderCart() {
  if (isCart) {
    cartInfo = getInfo('cart');
    var totalAmount = 0,
        totalPrice = 0;

    for (k in cartInfo) {
      var qty = cartInfo[k].qty,
          curPrice = cartInfo[k].price;

    // Если проверять актуальность в массиве:
    // var objectId = cartInfo[k].objectId,
    //     obj = items.find(item => item.object_id == objectId),
    //     value = cartInfo[k].qty,
    //     curPrice = obj.price_preorder1 == 0 ? obj.price1 : obj.price_preorder1,
    //     sizes = obj.sizes;
    // for (k in cartInfo) {
    //   var objectId = cartInfo[k].objectId,
    //       obj = items.find(item => item.object_id == objectId),
    //       qty = cartInfo[k].qty,
    //       curPrice = obj.price_preorder1 == 0 ? obj.price1 : obj.price_preorder1,
    //       sizes = obj.sizes;
    //   for (kk in sizes) {
    //     if (sizes[kk].k == k) {
    //       qty = qty > sizes[kk].free_qty ? sizes[kk].free_qty : qty;
    //     }
    //   }
      var articulPrice = qty * curPrice;
      totalAmount += qty;
      totalPrice += articulPrice;
    }
    headerCartAmount.textContent = totalAmount;
    headerCartPrice.textContent = convertPrice(totalPrice);
  }
}

//=====================================================================================================
// Функции для работы с контентом корзины:
//=====================================================================================================

// Отображение контента корзины:

function renderCart() {
  submenu.style.display = 'none';
  search.style.visibility = 'hidden';
  mainInfo.style.display = 'none';
  filtersContainer.style.display = 'none';
  gallery.style.display = 'none';
  galleryNotice.style.display = 'none';

  cart.style.display = 'block';
}

// Копирование корзины:

function copyCart() {
  cartCopy.textContent = cartTable.outerHTML;
  cartCopy.select();
  try {
    document.execCommand('copy');
    alert('Содержимое корзины скопировано в буфер обмена.');
  } catch (error) {
    console.error(error);
    alert('Не удалось скопировать cодержимое корзины.');
  }
}

//=====================================================================================================
//  Функции для изменения количества товаров в корзине и в карточке сайта:
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

function changeFromCard(id, sign) {
  var card = event.currentTarget.closest('.card'),
      size = event.currentTarget.closest('.card-size'),
      articul = size.querySelector('.size-articul').textContent.replace('Артикул: ', ''),
      input = size.querySelector('.choiced-qty'),
      inputValue = parseInt(input.value),
      qty = size.querySelector('.avaliable-qty'),
      qtyValue = parseInt(qty.textContent),
      curPrice = card.querySelector('.choiced-qty').dataset.price;

  inputValue = changeValue(sign, inputValue, qtyValue);
  input.value = inputValue;

  changeColors(size, inputValue);
  changeCardInfo(card, curPrice);
  saveCartInfo(articul, inputValue, curPrice, id);
  renderHeaderCart();
}

function changeFromCart(id, sign) {
  var cartRow = event.currentTarget.closest('.cart-row'),
      cartQty = cartRow.querySelector('.cart-qty'),
      articul = cartRow.querySelector('.cart-articul').textContent,
      input = cartRow.querySelector('.choiced-qty'),
      inputValue = parseInt(input.value),
      qty = size.querySelector('.avaliable-qty'),
      qtyValue = parseInt(qty.textContent),
      curPrice = card.querySelector('.choiced-qty').dataset.price;

  inputValue = changeValue(sign, inputValue, qtyValue);
  input.value = inputValue;

  changeColors(cartQty, inputValue);
  saveCartInfo(articul, inputValue, curPrice, id);
  renderHeaderCart();
}

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

function changeCardInfo(card, curPrice) {
  console.log('changeCardInfo');
  var selectInfo = card.querySelector('.card-select-info'),
      amount = card.querySelector('.select-count'),
      price = card.querySelector('.select-price'),
      sizes = card.querySelectorAll('.choiced-qty');

  var totalAmount = 0;
  sizes.forEach(size => totalAmount += parseInt(size.value));
  var totalPrice = totalAmount * curPrice;

  amount.textContent = totalAmount;
  price.textContent = convertPrice(totalPrice);

  if (amount.textContent != 0) {
    selectInfo.style.visibility = 'visible';
  } else {
    selectInfo.style.visibility = 'hidden';
  }
}

// Сохранение данных о состоянии корзины:

function saveCartInfo(articul, value, price, id) {
  cartInfo = getInfo('cart');
  if (value == 0) {
    delete cartInfo[articul];
  } else {
    if (!cartInfo[articul]) {
      cartInfo[articul] = {};
    }
    cartInfo[articul].type = pageId;
    cartInfo[articul].qty = value;
    cartInfo[articul].price = price;
    cartInfo[articul].id = id;
  }
  saveInfo(`cart`, cartInfo);
}
