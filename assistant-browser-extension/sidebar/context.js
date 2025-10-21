export function detectProductContext() {
  try {
    const docTitle = document.title || '';
    const url = document.referrer || '';
    let product = null;
    const priceMatch = docTitle.match(/\$\s?([0-9]+(?:\.[0-9]{2})?)/);
    if (priceMatch) {
      product = { price: priceMatch[0] };
    }
    return { url, title: docTitle, product };
  } catch (e) {
    return { error: e.message };
  }
}

export function detectTravelContext() {
  try {
    const url = document.referrer || '';
    const title = document.title || '';
    const hasDates = /(\d{1,2}\/\d{1,2}\/\d{2,4})/.test(title);
    return { url, title, hasDates };
  } catch (e) {
    return { error: e.message };
  }
}
