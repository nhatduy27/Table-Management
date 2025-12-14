# Table-Management

Repository quản lí code đồ án Web
---

## Thông tin chung

- Repo có 2 branch chính:
  - `main`: chứa source code ổn định nhất, có thể deploy sản phẩm.
  - `test`: chứa source code được gộp từ các feature branch của mọi người để kiểm tra lỗi, test tính năng tổng hợp.  
    Nếu chạy ổn, sẽ được merge vào `main`.

---

## Quy trình làm việc chung

1. Mỗi người khi làm tính năng mới sẽ:
   - Pull code mới nhất từ `main` về máy:

     ```bash
     git checkout main
     git pull origin main
     ```

   - Tạo branch tính năng riêng từ `main`:

     ```bash
     git checkout -b feature/<tên_tính_năng>-<tên_người_làm>
     ```

     Ví dụ: `feature/login-duy`

   - Code, commit nhiều lần trên branch tính năng.

   - Push branch tính năng lên remote:

     ```bash
     git push origin feature/<tên_tính_năng>-<tên_người_làm>
     ```

2. Khi hoàn thành tính năng và test chạy ổn trên local, mọi người tạo Pull Request (PR) từ branch tính năng vào `test` trên GitHub để các thành viên review và test tích hợp.

3. Sau khi PR được duyệt, merge vào branch `test`.

4. Team test kỹ trên branch `test`. Nếu ổn định, tạo PR từ `test` vào `main`.

5. Merge PR từ `test` vào `main` để cập nhật source code chính.

---

## Một số lệnh Git cơ bản thường dùng

| Lệnh                                              | Ý nghĩa                                       |
|---------------------------------------------------|-----------------------------------------------|
| `git checkout <tên_branch>`                       | Chuyển sang branch `<tên_branch>`             |
| `git pull origin <tên_branch>`                    | Lấy (pull) code mới nhất từ remote branch     |
| `git checkout -b feature/<tên>-<tên_người>`       | Tạo branch tính năng mới và chuyển sang đó    |
| `git add .`                                       | Thêm tất cả thay đổi vào vùng staging         |
| `git commit -m "Mô tả commit"`                    | Commit thay đổi với mô tả                     |
| `git push origin feature/<tên>-<tên_người>`       | Đẩy branch tính năng lên remote               |

---

## Lưu ý quan trọng

- Luôn cập nhật code mới nhất từ `main` trước khi bắt đầu làm tính năng.
- Nếu có xung đột khi merge hoặc pull, phải xử lý xung đột (conflict) trước khi tiếp tục.
- Không sửa trực tiếp trên branch `main` hoặc `test`.
- Thường xuyên cập nhật branch tính năng với `test` để tránh xung đột lớn.
- Mỗi branch tính năng nên chỉ tập trung vào một chức năng duy nhất để dễ quản lý.

---


