const RMB_TO_DH = 1.5;
const KG_PER_PIECE = 0.25;

let products = JSON.parse(localStorage.getItem('inventory-products') || '[]');

function updateTotals() {
  const totalPieces = products.reduce((sum, p) => sum + (p.pieces || 0), 0);
  const totalWeight = totalPieces * KG_PER_PIECE;
  const totalBaseRmb = products.reduce((sum, p) => sum + ((p.pieces || 0) * (p.priceRmb || 0)), 0);
  const totalLogRmb = products.reduce((sum, p) => {
    const weight = (p.pieces || 0) * KG_PER_PIECE;
    return sum + (weight * (p.logRmbKg || 0));
  }, 0);
  const totalCostRmb = totalBaseRmb + totalLogRmb;
  const totalSellDh = products.reduce((sum, p) => sum + ((p.pieces || 0) * (p.sellDh || 0)), 0);
  const totalSellRmb = totalSellDh * (1/RMB_TO_DH);
  const totalProfitRmb = totalSellRmb - totalCostRmb;
  
  document.getElementById('totBaseRmb').textContent = totalBaseRmb.toFixed(2);
  document.getElementById('totBaseDh').textContent = (totalBaseRmb * RMB_TO_DH).toFixed(2);
  document.getElementById('totWeight').textContent = totalWeight.toFixed(2);
  document.getElementById('totLogRmb').textContent = totalLogRmb.toFixed(2);
  document.getElementById('totLogDh').textContent = (totalLogRmb * RMB_TO_DH).toFixed(2);
  document.getElementById('totCostRmb').textContent = totalCostRmb.toFixed(2);
  document.getElementById('totCostDh').textContent = (totalCostRmb * RMB_TO_DH).toFixed(2);
  document.getElementById('totSellRmb').textContent = totalSellRmb.toFixed(2);
  document.getElementById('totSellDh').textContent = totalSellDh.toFixed(2);
  document.getElementById('totProfitRmb').textContent = totalProfitRmb.toFixed(2);
  document.getElementById('totProfitDh').textContent = (totalProfitRmb * RMB_TO_DH).toFixed(2);
}

function calcProduct(product) {
  const pieces = parseFloat(product.pieces) || 0;
  const priceRmb = parseFloat(product.priceRmb) || 0;
  const logRmbKg = parseFloat(product.logRmbKg) || 0;
  const sellDhPerPiece = parseFloat(product.sellDh) || 0;
  const sellRmbPerPiece = sellDhPerPiece / RMB_TO_DH;
  
  const weight = pieces * KG_PER_PIECE;
  const baseRmb = pieces * priceRmb;
  const baseDh = baseRmb * RMB_TO_DH;
  const logCostRmb = weight * logRmbKg;
  const logCostDh = logCostRmb * RMB_TO_DH;
  const totalCostRmb = baseRmb + logCostRmb;
  const totalCostDh = totalCostRmb * RMB_TO_DH;
  const totalSellRmb = pieces * sellRmbPerPiece;
  const totalSellDh = pieces * sellDhPerPiece;
  const profitRmb = totalSellRmb - totalCostRmb;
  const profitDh = profitRmb * RMB_TO_DH;
  
  return { 
    pieces, 
    priceRmb: priceRmb.toFixed(2), 
    baseRmb: baseRmb.toFixed(2), 
    baseDh: baseDh.toFixed(2), 
    weight: weight.toFixed(2), 
    logRmbKg: logRmbKg.toFixed(2), 
    logCostRmb: logCostRmb.toFixed(2), 
    logCostDh: logCostDh.toFixed(2), 
    totalCostRmb: totalCostRmb.toFixed(2), 
    totalCostDh: totalCostDh.toFixed(2), 
    sellRmb: sellRmbPerPiece.toFixed(2), 
    sellDh: sellDhPerPiece.toFixed(2), 
    profitRmb: profitRmb.toFixed(2), 
    profitDh: profitDh.toFixed(2) 
  };
}

function render() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  
  products.forEach((product, index) => {
    const calcs = calcProduct(product);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="number" value="${calcs.pieces}" min="0" step="1" onchange="updateProduct(${index}, 'pieces', this.value)" class="input"></td>
      <td><input type="number" value="${calcs.priceRmb}" min="0" step="0.01" onchange="updateProduct(${index}, 'priceRmb', this.value)" class="input"></td>
      <td>${calcs.baseRmb}</td>
      <td>${calcs.baseDh}</td>
      <td>${calcs.weight}</td>
      <td><input type="number" value="${calcs.logRmbKg}" min="0" step="0.01" onchange="updateProduct(${index}, 'logRmbKg', this.value)" class="input"></td>
      <td>${calcs.logCostRmb}</td>
      <td>${calcs.logCostDh}</td>
      <td>${calcs.totalCostRmb}</td>
      <td>${calcs.totalCostDh}</td>
      <td>${calcs.sellRmb}</td>
      <td><input type="number" value="${calcs.sellDh}" min="0" step="0.01" onchange="updateProduct(${index}, 'sellDh', this.value)" class="input"></td>
      <td>${calcs.profitRmb}</td>
      <td>${calcs.profitDh}</td>
      <td><button onclick="deleteRow(${index})" class="delete-btn">×</button></td>
    `;
    tbody.appendChild(row);
  });
  
  updateTotals();
}

function updateProduct(index, field, value) {
  products[index][field] = parseFloat(value) || 0;
  localStorage.setItem('inventory-products', JSON.stringify(products));
  render();
}

function addRow() {
  products.push({pieces: 1, priceRmb: 0, logRmbKg: 0, sellDh: 0});
  localStorage.setItem('inventory-products', JSON.stringify(products));
  render();
}

function deleteRow(index) {
  products.splice(index, 1);
  localStorage.setItem('inventory-products', JSON.stringify(products));
  render();
}

function exportData() {
  let csv = 'Pieces,Price RMB,Base RMB,Base DH,Weight,Log RMB/KG,Log Cost RMB,Log Cost DH,Total Cost RMB,Total Cost DH,Sell RMB,Sell DH,Profit RMB,Profit DH\n';
  products.forEach(p => {
    const c = calcProduct(p);
    csv += `${c.pieces},${c.priceRmb},${c.baseRmb},${c.baseDh},${c.weight},${c.logRmbKg},${c.logCostRmb},${c.logCostDh},${c.totalCostRmb},${c.totalCostDh},${c.sellRmb},${c.sellDh},${c.profitRmb},${c.profitDh}\n`;
  });
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'inventory.csv';
  a.click();
}

function clearData() {
  if (confirm('Clear all data?')) {
    products = [];
    localStorage.removeItem('inventory-products');
    render();
  }
}

render();

