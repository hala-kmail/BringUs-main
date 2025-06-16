const deliveryAreas = [
  { id: 1, value: 'الضفة', label: { ar: 'الضفة (20₪)', en: 'West Bank (20₪)' }, price: 20 },
  { id: 2, value: 'الداخل', label: { ar: 'الداخل (70₪)', en: 'the occupied interior (70₪)' }, price: 70 },
  { id: 3, value: 'القدس', label: { ar: 'القدس (30₪)', en: 'Jerusalem (30₪)' }, price: 30 },
];

export function getShippingPriceByAreaId(areaId) {
  const area = deliveryAreas.find(a => a.id === Number(areaId));
  return area ? area.price : 0;
}

export function getAreaLabelById(areaId, lang = 'ar') {
  const area = deliveryAreas.find(a => a.id === Number(areaId));
  return area ? area.label[lang] : '';
}

export function getDefaultAreaIdFromLocalStorage() {
  const stored = localStorage.getItem('register_area');
  if (stored && deliveryAreas.some(a => a.id === Number(stored))) {
    return Number(stored);
  }
  return deliveryAreas[0].id;
}

export function getDefaultShippingPriceFromLocalStorage() {
  const defaultId = getDefaultAreaIdFromLocalStorage();
  return getShippingPriceByAreaId(defaultId);
}

export default deliveryAreas; 