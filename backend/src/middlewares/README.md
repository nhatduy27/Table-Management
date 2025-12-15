# Middlewares

## Người 2 - QR Code System

Folder này chứa các middleware functions.

### Files cần tạo:
- `verifyQR.js` - Middleware verify QR token
  - verifyQRToken(req, res, next)
  - Check token validity
  - Check table status
  - Attach table data to req.table
