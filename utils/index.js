const objectKeySorter = (obj) => {
  const reformat = JSON.stringify(obj, Object.keys(obj).sort());
  return JSON.parse(reformat);
};

const jwtUrlExeption = (url) => {
  return new RegExp(`${url}(.*)`,);
};

module.exports = { objectKeySorter, jwtUrlExeption };
