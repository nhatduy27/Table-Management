# Services

## Người 3 - Frontend UI

Folder này chứa các API service functions.

### Files cần tạo:
- `api.js` - Base axios configuration
  - Base URL setup
  - Request/response interceptors
  - Error handling
  
- `tableAPI.js` - Table management API calls
  - getAllTables(filters)
  - getTableById(id)
  - createTable(data)
  - updateTable(id, data)
  - updateTableStatus(id, status)
  - generateQR(id)
  - regenerateQR(id)
  - downloadQR(id, format)
  - downloadAllQR()
