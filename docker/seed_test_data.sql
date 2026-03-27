INSERT INTO categories (name, code) VALUES ('Món ăn', 'FOOD') ON CONFLICT DO NOTHING;
INSERT INTO categories (name, code) VALUES ('Địa điểm', 'PLACE') ON CONFLICT DO NOTHING;

INSERT INTO places (name, description, location, rating, price_range, is_active, category_id, tags)
VALUES 
('Bánh mì Huynh Hoa', 'Bánh mì thịt nổi tiếng nhất Sài Gòn với lớp pate béo ngậy và chả lụa dày đặc', 'Hồ Chí Minh', 4.8, '$$', true, (SELECT id FROM categories WHERE code = 'FOOD' LIMIT 1), 'ẩm thực, bánh mì, sài gòn, ăn nhẹ'),
('Phở Bát Đàn', 'Quán phở gia truyền mang đậm hương vị phở bò truyền thống Hà Nội, nước dùng thanh ngọt mặn mà', 'Hà Nội', 4.5, '$$', true, (SELECT id FROM categories WHERE code = 'FOOD' LIMIT 1), 'ẩm thực, phở, hà nội, truyền thống'),
('Bún chả Hương Liên', 'Quán bún chả nổi tiếng thế giới từng đón tổng thống Obama, chả nướng thơm lừng', 'Hà Nội', 4.6, '$$', true, (SELECT id FROM categories WHERE code = 'FOOD' LIMIT 1), 'ẩm thực, bún chả, hà nội'),
('Dinh Độc Lập', 'Di tích lịch sử văn hóa cấp quốc gia, công trình kiến trúc biểu tượng của Sài Gòn', 'Hồ Chí Minh', 4.7, '$', true, (SELECT id FROM categories WHERE code = 'PLACE' LIMIT 1), 'du lịch, lịch sử, sài gòn, kiến trúc'),
('Hồ Hoàn Kiếm', 'Biểu tượng lịch sử thủ đô, không gian xanh giữa lòng Hà Nội với cầu Thê Húc, đền Ngọc Sơn', 'Hà Nội', 4.9, 'Free', true, (SELECT id FROM categories WHERE code = 'PLACE' LIMIT 1), 'du lịch, phong cảnh, hà nội, di tích');
