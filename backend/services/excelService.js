const XLSX = require('xlsx');

const createExcelFile = (data) => {
  // create worksheet from data json
  const worksheet = XLSX.utils.json_to_sheet(data);

  // create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // save workbook inside buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return buffer;
};

module.exports = { createExcelFile};