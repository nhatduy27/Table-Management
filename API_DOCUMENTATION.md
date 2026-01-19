# API Documentation - Menu Endpoints

## Base URL

```
http://localhost:5000/api
```

---

## Guest Menu API

### Authentication

Guest API yêu cầu xác thực thông qua QR Token. Token được nhúng trong URL khi khách quét mã QR tại bàn.

**Required Query Parameters:**

-   `table` - UUID của bàn
-   `token` - JWT token được tạo khi generate QR code

**Ví dụ URL:**

```
/api/menu?table=550e8400-e29b-41d4-a716-446655440000&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### GET /api/menu

Lấy danh sách menu cho khách hàng.

**Query Parameters:**

| Parameter         | Type    | Required | Default | Description                            |
| ----------------- | ------- | -------- | ------- | -------------------------------------- |
| `table`           | UUID    | ✅ Yes   | -       | ID của bàn                             |
| `token`           | string  | ✅ Yes   | -       | QR token để xác thực                   |
| `q`               | string  | No       | -       | Tìm kiếm theo tên món                  |
| `categoryId`      | UUID    | No       | -       | Lọc theo category                      |
| `sort`            | string  | No       | `name`  | Sắp xếp: `name`, `price`, `price_desc` |
| `chefRecommended` | boolean | No       | `false` | Chỉ lấy món chef recommend             |
| `page`            | number  | No       | `1`     | Trang hiện tại                         |
| `limit`           | number  | No       | `10`    | Số item mỗi trang                      |

**Response Success (200):**

```json
{
	"success": true,
	"data": {
		"table": {
			"id": "550e8400-e29b-41d4-a716-446655440000",
			"table_number": "A1",
			"capacity": 4,
			"status": "active"
		},
		"categories": [
			{
				"id": "uuid",
				"name": "Appetizers",
				"display_order": 1,
				"description": "Start your meal"
			}
		],
		"items": [
			{
				"id": "uuid",
				"name": "Spring Rolls",
				"description": "Crispy vegetable rolls",
				"price": "8.99",
				"is_chef_recommended": true,
				"status": "available",
				"prep_time_minutes": 15,
				"primary_photo": {
					"id": "uuid",
					"url": "https://cloudinary.com/...",
					"is_primary": true
				},
				"category": {
					"id": "uuid",
					"name": "Appetizers"
				},
				"modifierGroups": [
					{
						"id": "uuid",
						"name": "Sauce Options",
						"is_required": false,
						"min_selections": 0,
						"max_selections": 2,
						"options": [
							{
								"id": "uuid",
								"name": "Sweet Chili",
								"price_adjustment": "0.50"
							}
						]
					}
				]
			}
		],
		"pagination": {
			"currentPage": 1,
			"totalPages": 5,
			"totalItems": 50,
			"limit": 10,
			"hasNextPage": true,
			"hasPrevPage": false
		}
	}
}
```

**Response Errors:**

| Status | Error                      | Description                     |
| ------ | -------------------------- | ------------------------------- |
| 400    | Missing table ID or token  | Thiếu query parameters          |
| 401    | Invalid or expired token   | Token không hợp lệ hoặc hết hạn |
| 401    | Token does not match table | Token không khớp với bàn        |
| 401    | Token has been regenerated | QR code đã được tạo lại         |
| 403    | Table is inactive          | Bàn đang không hoạt động        |
| 404    | Table not found            | Không tìm thấy bàn              |
| 500    | Internal server error      | Lỗi server                      |

---

## Menu Visibility Rules (Guest)

### 1. QR Token Verification Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Khách quét QR  │────▶│  Verify Token    │────▶│  Load Menu      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │  Kiểm tra:               │
                    │  1. Token có hợp lệ?     │
                    │  2. Token khớp tableId?  │
                    │  3. Table status=active? │
                    │  4. Token chưa regenerate│
                    └──────────────────────────┘
```

### 2. Category Visibility

| Rule                        | Description                                   |
| --------------------------- | --------------------------------------------- |
| **Status = "active"**       | Chỉ hiển thị categories có `status: "active"` |
| **Sorted by display_order** | Sắp xếp theo `display_order` tăng dần         |

**Không hiển thị:**

-   Categories có `status: "inactive"`
-   Categories đã bị xóa

### 3. Menu Item Visibility

| Rule                         | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| **Không filter theo status** | Hiển thị tất cả items (available, unavailable, sold_out) |
| **is_deleted = false**       | Chỉ hiển thị items chưa bị xóa (default scope)           |
| **Category filter**          | Nếu có `categoryId`, chỉ lấy items của category đó       |

**Item Status hiển thị:**

-   `available` - Có thể đặt hàng
-   `unavailable` - Tạm hết (không cho đặt)
-   `sold_out` - Hết món (hiển thị overlay "Sold Out")

### 4. Photo Visibility

| Rule                   | Description                             |
| ---------------------- | --------------------------------------- |
| **Primary photo only** | Chỉ lấy ảnh có `is_primary: true`       |
| **Optional**           | Nếu không có ảnh, `primary_photo: null` |

### 5. Modifier Groups Visibility

| Rule                 | Description                                    |
| -------------------- | ---------------------------------------------- |
| **Attached to item** | Chỉ hiển thị modifier groups được gắn với item |
| **With options**     | Bao gồm tất cả options của group               |

**Modifier Group fields:**

-   `is_required` - Bắt buộc chọn?
-   `min_selections` - Số lựa chọn tối thiểu
-   `max_selections` - Số lựa chọn tối đa

---

## Admin Menu API

### Categories

#### GET /api/admin/menu/categories

Lấy danh sách tất cả categories.

#### POST /api/admin/menu/categories

Tạo category mới.

**Body:**

```json
{
	"name": "Appetizers",
	"description": "Start your meal",
	"display_order": 1
}
```

#### PUT /api/admin/menu/categories/:id

Cập nhật category.

#### PATCH /api/admin/menu/categories/:id/status

Cập nhật status category (active/inactive).

#### PATCH /api/admin/menu/categories/:id/delete

Soft delete category.

---

### Menu Items

#### GET /api/admin/menu/items

Lấy danh sách tất cả items.

#### GET /api/admin/menu/items/:id

Lấy chi tiết item theo ID.

#### POST /api/admin/menu/items

Tạo item mới.

**Body:**

```json
{
	"name": "Spring Rolls",
	"description": "Crispy vegetable rolls",
	"price": 8.99,
	"category_id": "uuid",
	"prep_time_minutes": 15,
	"is_chef_recommended": true,
	"status": "available"
}
```

#### PUT /api/admin/menu/items/:id

Cập nhật item.

#### DELETE /api/admin/menu/items/:id

Xóa item.

---

### Modifier Groups

#### GET /api/admin/menu/modifier-groups

Lấy danh sách modifier groups.

#### GET /api/admin/menu/modifier-groups/:id

Lấy chi tiết modifier group.

#### POST /api/admin/menu/modifier-groups

Tạo modifier group mới.

**Body:**

```json
{
	"name": "Sauce Options",
	"is_required": false,
	"min_selections": 0,
	"max_selections": 2
}
```

#### PUT /api/admin/menu/modifier-groups/:id

Cập nhật modifier group.

#### DELETE /api/admin/menu/modifier-groups/:id

Xóa modifier group.

---

### Modifier Options

#### POST /api/admin/menu/modifier-groups/:id/options

Tạo option cho modifier group.

**Body:**

```json
{
	"name": "Sweet Chili",
	"price_adjustment": 0.5
}
```

#### PUT /api/admin/menu/modifier-options/:id

Cập nhật option.

#### DELETE /api/admin/menu/modifier-options/:id

Xóa option.

---

### Attach Modifiers to Items

#### POST /api/admin/menu/items/:id/modifier-groups

Gắn modifier group vào item.

**Body:**

```json
{
	"modifierGroupId": "uuid"
}
```

---

## Data Models

### MenuItem

```javascript
{
  id: UUID,
  category_id: UUID,
  name: String(80),        // 2-80 chars
  description: Text,
  price: Decimal(12,2),    // min: 0.01
  prep_time_minutes: Int,  // 0-240
  status: Enum,            // 'available', 'unavailable', 'sold_out'
  is_chef_recommended: Boolean,
  is_deleted: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

### MenuCategory

```javascript
{
  id: UUID,
  name: String,
  description: Text,
  display_order: Int,
  status: Enum,           // 'active', 'inactive'
  created_at: DateTime
}
```

### MenuItemPhoto

```javascript
{
  id: UUID,
  menu_item_id: UUID,
  url: Text,
  is_primary: Boolean,
  created_at: DateTime
}
```

### ModifierGroup

```javascript
{
  id: UUID,
  name: String,
  is_required: Boolean,
  min_selections: Int,
  max_selections: Int
}
```

### ModifierOption

```javascript
{
  id: UUID,
  modifier_group_id: UUID,
  name: String,
  price_adjustment: Decimal
}
```

---

## Security Notes

1. **QR Token Expiration**: Token có thời hạn, sau khi hết hạn khách cần quét lại QR
2. **Token Regeneration**: Khi staff tạo lại QR code, token cũ sẽ không còn hợp lệ
3. **Table Status Check**: Chỉ cho phép truy cập menu khi bàn có status "active"
4. **Logging**: Các truy cập với token không hợp lệ được ghi log để theo dõi bảo mật
