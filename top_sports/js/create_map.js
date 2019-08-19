ymaps.ready(init);
function init() {
	var myMap = new ymaps.Map('map', {
			center: [53.313909, 49.962773],
			zoom: 6,
			controls: []
	});

	myMap.controls.add('zoomControl');
//	myMap.behaviors.disable('scrollZoom');
	myMap.events.add('click', function () {
		myMap.balloon.close();
	});

	var data = JSON.parse(document.getElementById('map-points').innerHTML);

	// Контейнер для меню.
	var menu = $('<div class="city_cont"/>');

	// Перебираем все группы.
	$.each(data, function (index, items) {
		// DOM-представление группы.
		var menuItem = $('<div class="city_title">' + index + '<span></span></div>'),
		// Создадим коллекцию для геообъектов группы.
		collection = new ymaps.GeoObjectCollection(null);

		// Добавляем коллекцию на карту.
		myMap.geoObjects.add(collection);

		menuItem
		// Добавляем пункт в меню.
		.appendTo(menu)
		// Навешиваем обработчик клика по пункту меню.
		.on('click', function (e) {
			// Скрываем/отображаем пункты меню данной группы.
			$(this)
			.toggleClass('active')
			.nextUntil('.city_title')
			.removeClass('active')
			.slideToggle('fast');

			// Скрываем/отображаем коллекцию на карте.
			if (collection.getParent()) {
				myMap.geoObjects.add(collection);
			} else {
				myMap.geoObjects.remove(collection);
			}
		});

		// Перебираем элементы группы.
		$.each(items, function (i, item) {
			//			console.log(item);
			var coord = [item.coordX, item.coordY];
			// DOM-представление элемента группы.
			var menuItem = $('<div class="shop_cont" data-coord="' + coord + '"><div class="shop_title">' + item.title + '</div><div class="shop_address"><a href="geo:'+item.coordX+','+item.coordY+'">' + item.address + '</a></div><div class="shop_phone"><a href="tel:' + item.phone + '">' + item.phone + '</a></div></div>'),
			// Создаем метку.
			placemark = new ymaps.Placemark([item.coordX, item.coordY], {
					//				balloonContent: coord
					balloonContentHeader: '<div class="baloon_' + item.dealer + '"><strong>' + item.title + '</strong></div>',
					balloonContentBody: '<div><a href="geo:'+item.coordX+','+item.coordY+'">' + item.address + '</a></div>',
					balloonContentFooter: '<div><a href="tel:' + item.phone + '">' + item.phone + '</a></div>',
					hintContent: item.title
				}, {
					preset: 'islands#blueShoppingIcon',
					iconColor: '#' + item.color
				});

			// Добавляем метку в коллекцию.
			collection.add(placemark);

			menuItem
			// Добавляем пункт в меню.
			.appendTo(menu)
			// Навешиваем обработчик клика по пункту меню.
			.on('click', function (e) {
				// Отменяем основное поведение (переход по ссылке)
//				e.preventDefault();

				// Выставляем/убираем класс active.
				menuItem
				.toggleClass('active')
				.siblings('.shop_cont.active')
				.removeClass('active');

				// Получаем координаты placemark.
				var coords = placemark.geometry.getCoordinates();
				// Плавно перелетаем по координатам.
				myMap.panTo([coords], {
					delay: 0
				}).then(function () {
					// Увеличиваем масштаб на объекте.
					myMap.setZoom(16);
					// Открываем/закрываем баллун у метки.
					if(placemark.balloon.isOpen()) {
						placemark.balloon.close();
					} else {
						placemark.balloon.open();
					}
				});
			});
		});
	});

	// Добавляем меню в сайдбар.
	menu.appendTo($('#dealers_list .list'));
	// Выставляем масштаб карты чтобы были видны все группы.
	//	myMap.setBounds(myMap.geoObjects.getBounds());
}