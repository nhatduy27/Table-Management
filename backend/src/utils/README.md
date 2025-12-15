# Utils

## Người 2 - QR Code System

Folder này chứa các utility functions cho QR code generation.

### Files cần tạo:
- `qrGenerator.js` - Generate QR code images
  - generateQRCode(data, options)
  - generateQRCodePNG(tableId, token)
  - generateQRCodePDF(tableData)
  
- `tokenSigner.js` - JWT token signing/verification
  - signQRToken(tableId, restaurantId)
  - verifyQRToken(token)
  - invalidateToken()
