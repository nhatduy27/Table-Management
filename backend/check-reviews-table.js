// Script kiểm tra table reviews
import sequelize from './src/config/database.js';
import MenuItemReview from './src/models/menuItemReview.js';

async function checkTable() {
  try {
    console.log('🔍 Đang kết nối database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối thành công!');

    // Kiểm tra table có tồn tại không
    console.log('\n🔍 Kiểm tra table menu_item_reviews...');
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'menu_item_reviews'
    `);

    if (results.length > 0) {
      console.log('✅ Table menu_item_reviews TỒN TẠI');
      
      // Đếm số reviews
      const count = await MenuItemReview.count();
      console.log(`📊 Số lượng reviews: ${count}`);
      
      // Lấy 5 reviews mới nhất
      const reviews = await MenuItemReview.findAll({
        limit: 5,
        order: [['created_at', 'DESC']]
      });
      
      console.log('\n📝 5 reviews mới nhất:');
      reviews.forEach(r => {
        console.log(`- ID: ${r.id}, Rating: ${r.rating}, Item: ${r.menu_item_id}, Comment: ${r.comment || 'N/A'}`);
      });
    } else {
      console.log('❌ Table menu_item_reviews CHƯA TỒN TẠI!');
      console.log('💡 Cần chạy migration: backend/migrations/006_create_reviews_table.sql');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.message.includes('relation "menu_item_reviews" does not exist')) {
      console.log('\n💡 TABLE CHƯA ĐƯỢC TẠO! Chạy migration ngay:');
      console.log('Cách 1: Dùng pgAdmin hoặc DBeaver import file SQL');
      console.log('Cách 2: Nếu có psql: psql -U postgres -d table_management -f backend/migrations/006_create_reviews_table.sql');
    }
  } finally {
    await sequelize.close();
  }
}

checkTable();
