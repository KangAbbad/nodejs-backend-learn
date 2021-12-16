const objectKeySorter = (obj) => {
  const reformat = JSON.stringify(obj, Object.keys(obj).sort());
  return JSON.parse(reformat);
};

module.exports = { objectKeySorter };
