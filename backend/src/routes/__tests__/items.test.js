const request = require('supertest');
const express = require('express');
const itemsRouter = require('../items');
const { expressErrorHandler } = require('../../middleware/errorHandler');
const fs = require('fs').promises;
const path = require('path');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);
app.use(expressErrorHandler); // Add error handler for tests

// Test data path (test file is one level deeper than route file, so need 4 levels up)
const TEST_DATA_PATH = path.join(__dirname, '../../../../data/items.json');
const ORIGINAL_DATA_PATH = path.join(__dirname, '../../../../data/items.json.backup');
const DATA_DIR = path.dirname(TEST_DATA_PATH);

// Ensure directory exists before writing
async function ensureDirectoryExists() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Directory might already exist, that's okay
  }
}

// Backup and restore test data
async function backupData() {
  await ensureDirectoryExists();
  try {
    const data = await fs.readFile(TEST_DATA_PATH, 'utf8');
    await fs.writeFile(ORIGINAL_DATA_PATH, data, 'utf8');
  } catch (err) {
    // Backup file might not exist, that's okay
  }
}

async function restoreData() {
  await ensureDirectoryExists();
  try {
    const data = await fs.readFile(ORIGINAL_DATA_PATH, 'utf8');
    await fs.writeFile(TEST_DATA_PATH, data, 'utf8');
  } catch (err) {
    // If backup doesn't exist, create default test data
    const defaultData = [
      { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
      { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
      { id: 3, name: 'Ultra-Wide Monitor', category: 'Electronics', price: 999 },
      { id: 4, name: 'Ergonomic Chair', category: 'Furniture', price: 799 },
      { id: 5, name: 'Standing Desk', category: 'Furniture', price: 1199 }
    ];
    await fs.writeFile(TEST_DATA_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

describe('Items Routes', () => {
  beforeAll(async () => {
    await backupData();
  });

  afterAll(async () => {
    await restoreData();
    // Clean up backup file
    try {
      await fs.unlink(ORIGINAL_DATA_PATH);
    } catch (err) {
      // Ignore if file doesn't exist
    }
  });

  beforeEach(async () => {
    await restoreData();
  });

  describe('GET /api/items', () => {
    it('should return all items with pagination info', async () => {
      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should return paginated results when limit is provided', async () => {
      const response = await request(app)
        .get('/api/items?limit=2')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.limit).toBe(2);
      expect(response.body.total).toBeGreaterThanOrEqual(2);
    });

    it('should return correct page when page parameter is provided', async () => {
      const response = await request(app)
        .get('/api/items?limit=2&page=2')
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.items.length).toBeLessThanOrEqual(2);
    });

    it('should filter items by search query', async () => {
      const response = await request(app)
        .get('/api/items?q=laptop')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0].name.toLowerCase()).toContain('laptop');
    });

    it('should filter items by category in search', async () => {
      const response = await request(app)
        .get('/api/items?q=electronics')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items.every(item => 
        item.name.toLowerCase().includes('electronics') || 
        item.category.toLowerCase().includes('electronics')
      )).toBe(true);
    });

    it('should return empty array when search has no matches', async () => {
      const response = await request(app)
        .get('/api/items?q=nonexistentitemxyz123')
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a single item by id', async () => {
      const response = await request(app)
        .get('/api/items/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('price');
    });

    it('should return 404 when item is not found', async () => {
      const response = await request(app)
        .get('/api/items/99999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid id format gracefully', async () => {
      const response = await request(app)
        .get('/api/items/abc')
        .expect(404);
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'Test Item',
        category: 'Test Category',
        price: 99.99
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.category).toBe(newItem.category);
      expect(response.body.price).toBe(newItem.price);
    });

    it('should return 400 when name is missing', async () => {
      const invalidItem = {
        category: 'Test Category',
        price: 99.99
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when category is missing', async () => {
      const invalidItem = {
        name: 'Test Item',
        price: 99.99
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);
    });

    it('should return 400 when price is missing', async () => {
      const invalidItem = {
        name: 'Test Item',
        category: 'Test Category'
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);
    });

    it('should return 400 when price is not a number', async () => {
      const invalidItem = {
        name: 'Test Item',
        category: 'Test Category',
        price: 'not-a-number'
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);
    });

    it('should persist the new item to the file', async () => {
      const newItem = {
        name: 'Persistent Item',
        category: 'Test Category',
        price: 199.99
      };

      await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      // Verify item was saved by fetching it
      const data = await fs.readFile(TEST_DATA_PATH, 'utf8');
      const items = JSON.parse(data);
      const createdItem = items.find(item => item.name === newItem.name);
      expect(createdItem).toBeDefined();
      expect(createdItem.category).toBe(newItem.category);
      expect(createdItem.price).toBe(newItem.price);
    });
  });
});

