// THÊM DÒNG IMPORT NÀY Ở ĐẦU FILE
import Table from '../models/table.js';

//Lấy tất cả bàn
export const getAllTable = async (req, res) => {
  try {
   
    const tables = await Table.findAll({
      order: [['created_at', 'DESC']]
    });
    
    res.json({ 
      success: true, 
      message: 'Get all tables',
      data: tables  
    });
  } catch (error) {
    console.error('Error getting tables:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

//Tạo bàn mới
export const createTable = async (req, res) => {
  try {
    const { table_number, capacity } = req.body;
    
    // validate tạm thời
    if (!table_number || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Table number and capacity are required'
      });
    }
    
    const newTable = await Table.create({
      table_number,
      capacity,
      status: 'active'
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Table created successfully',
      data: newTable 
    });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

//Lấy bàn theo ID  
export const getTableById = async (req, res) => {
  try {
    const { id } = req.params;
  
    const table = await Table.findByPk(id);
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }
    
    res.json({ 
      success: true, 
      message: `Get table by ID: ${id}`,
      data: table 
    });
  } catch (error) {
    console.error('Error getting table by ID:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
