var tableEl = {
  articul: '673371163863',
  name: 'Очки солнцезащитные Spy Optic Atlas HAPPY, взрослые (SOFT MATTE BLACK/TORT FADE - GRAY GREEN)',
  price_retail: '20 350,00',
  discount: '32',
  price_opt: '3 350,00',
  qty: '0',
  price_opt_total: '15 350,00',
  price_retail_total: '12 350,00'
};

var tableData = [];
for (let i = 1; i <= 10000; i++) {
  var copy = Object.assign({}, tableEl);
  copy.qty = i;
  tableData.push(copy);
}
