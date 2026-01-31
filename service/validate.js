function isValidUrl(url) {
  try {
    const urlToValidate = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
     new URL(urlToValidate);
     return true;
  } catch(error) {
    return false;
  }
}

module.exports = isValidUrl;