import { pool } from "../config/database";
import { hashPassword } from "../utils/password";

export async function runMigrations(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    console.log("[Migration] Starting database migration for Sprint 2...");

    // 1. Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Create Categories Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Create Products Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        material VARCHAR(100) NOT NULL DEFAULT '18K Yellow Gold',
        gemstone VARCHAR(100) NOT NULL DEFAULT 'Diamond',
        carat_weight VARCHAR(50) DEFAULT '1.50 ct',
        stock INT NOT NULL DEFAULT 10,
        in_stock TINYINT(1) NOT NULL DEFAULT 1,
        is_featured TINYINT(1) NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        INDEX idx_category (category_id),
        INDEX idx_featured (is_featured),
        INDEX idx_price (price),
        INDEX idx_stock (stock)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure columns exist on products if table was created previously
    try {
      const [columns] = await connection.query<any[]>("SHOW COLUMNS FROM products LIKE 'stock'");
      if (columns.length === 0) {
        await connection.query("ALTER TABLE products ADD COLUMN stock INT NOT NULL DEFAULT 10 AFTER carat_weight");
      }
    } catch (e) {
      // Ignore if column already exists
    }

    try {
      const [columns] = await connection.query<any[]>("SHOW COLUMNS FROM products LIKE 'is_active'");
      if (columns.length === 0) {
        await connection.query("ALTER TABLE products ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER is_featured");
      }
    } catch (e) {
      // Ignore if column already exists
    }

    // 4. Create Inquiries / Appointments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        product_id INT NULL,
        message TEXT NOT NULL,
        status ENUM('pending', 'contacted', 'scheduled', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Create Orders Table (Sprint 4)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
        total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        customer_name VARCHAR(255) NULL,
        customer_email VARCHAR(255) NULL,
        customer_phone VARCHAR(50) NULL,
        shipping_address TEXT,
        city VARCHAR(100) NULL,
        postal_code VARCHAR(50) NULL,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'cod',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_created (created_at),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure Sprint 4 checkout columns exist on orders if table was created previously
    const orderColumnsToAdd = [
      { name: "customer_name", sql: "ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255) NULL AFTER total_amount" },
      { name: "customer_email", sql: "ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255) NULL AFTER customer_name" },
      { name: "customer_phone", sql: "ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(50) NULL AFTER customer_email" },
      { name: "city", sql: "ALTER TABLE orders ADD COLUMN city VARCHAR(100) NULL AFTER shipping_address" },
      { name: "postal_code", sql: "ALTER TABLE orders ADD COLUMN postal_code VARCHAR(50) NULL AFTER city" },
      { name: "payment_method", sql: "ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) NOT NULL DEFAULT 'cod' AFTER postal_code" },
    ];

    for (const col of orderColumnsToAdd) {
      try {
        const [cols] = await connection.query<any[]>(`SHOW COLUMNS FROM orders LIKE '${col.name}'`);
        if (cols.length === 0) {
          await connection.query(col.sql);
        }
      } catch (e) {
        // Ignore if column already exists
      }
    }

    // 6. Create Order Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
        INDEX idx_order (order_id),
        INDEX idx_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Create User Activity Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        user_id INT NULL,
        current_page VARCHAR(255) NOT NULL,
        product_id INT NULL,
        activity_type ENUM('page_view', 'product_view', 'heartbeat') NOT NULL DEFAULT 'page_view',
        last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
        INDEX idx_session (session_id),
        INDEX idx_last_activity (last_activity_at),
        INDEX idx_product_view (product_id, activity_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Create Cart Table (Sprint 3)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_cart_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. Create Cart Items Table (Sprint 3)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cart_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_cart_product (cart_id, product_id),
        INDEX idx_cart_id (cart_id),
        INDEX idx_cart_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("[Migration] All Sprint 2 & Sprint 3 tables verified successfully.");

    // Seed Categories if empty
    const [catRows] = await connection.query<any[]>("SELECT COUNT(*) as count FROM categories");
    if (catRows[0].count === 0) {
      console.log("[Migration] Seeding initial categories...");
      await connection.query(`
        INSERT INTO categories (name, slug, description, image_url) VALUES
        ('Rings', 'rings', 'Handcrafted solitaire and eternity rings in 18k gold and platinum', '/images/collection-rings.jpg'),
        ('Earrings', 'earrings', 'Graceful drop, chandelier and diamond stud accents of elegance', '/images/collection-earrings.jpg'),
        ('Necklaces', 'necklaces', 'Delicate gold chains, bespoke pendants and haute joaillerie colliers', '/images/collection-necklaces.jpg'),
        ('Bracelets', 'bracelets', 'Artisan tennis bracelets, diamond cuffs and engraved bangles', '/images/collection-rings.jpg'),
        ('Jewellery Sets', 'jewellery-sets', 'Harmonized bridal and gala jewelry parures in rare gems', '/images/hero-bg.jpg'),
        ('High Joaillerie', 'high-joaillerie', 'One-of-a-kind museum-grade certified rare gemstone creations', '/images/hero-bg.jpg')
      `);
    }

    // Seed Products if empty
    const [prodRows] = await connection.query<any[]>("SELECT COUNT(*) as count FROM products");
    if (prodRows[0].count === 0) {
      console.log("[Migration] Seeding initial luxury products...");
      await connection.query(`
        INSERT INTO products (name, slug, description, price, category_id, image_url, material, gemstone, carat_weight, stock, in_stock, is_featured, is_active) VALUES
        ('The Aurelia Solitaire Diamond Ring', 'aurelia-solitaire-diamond-ring', 'Exquisitely crafted in 18k Yellow Gold featuring a brilliant round-cut VVS1 diamond held in a refined 6-prong crown setting.', 6800.00, 1, '/images/collection-rings.jpg', '18K Yellow Gold', 'Brilliant Cut Diamond', '2.10 ct', 8, 1, 1, 1),
        ('Eternity Pavé Diamond Band', 'eternity-pave-diamond-band', 'Continuous micro-pavé diamonds wrapping seamlessly around a knife-edge band of solid 950 Platinum.', 3450.00, 1, '/images/collection-rings.jpg', '950 Platinum', 'Pavé Diamonds', '1.25 ct', 14, 1, 1, 1),
        ('Lumière Chandelier Drop Earrings', 'lumiere-chandelier-drop-earrings', 'Graceful cascading diamond chandelier earrings that capture and refract light from every angle with unparalleled brilliance.', 8900.00, 2, '/images/collection-earrings.jpg', '18K White Gold', 'Diamond Cluster', '3.50 ct', 5, 1, 1, 1),
        ('Celeste Royal Diamond Studs', 'celeste-royal-diamond-studs', 'A signature pair of matching emerald-cut diamonds with halo micro-diamonds designed for daily timeless elegance.', 4200.00, 2, '/images/collection-earrings.jpg', '18K Yellow Gold', 'Emerald Cut Diamond', '1.80 ct', 12, 1, 0, 1),
        ('Seraphina Amber Citrine Pendant', 'seraphina-amber-citrine-pendant', 'A luminous natural golden citrine stone suspended on an ultra-delicate hand-linked 18k gold Italian cable chain.', 2950.00, 3, '/images/collection-necklaces.jpg', '18K Yellow Gold', 'Golden Citrine & Diamond', '4.20 ct', 7, 1, 1, 1),
        ('L\\'Étoile Diamond Tennis Collier', 'letoile-diamond-tennis-collier', 'The epitome of high jewelry: eighty-four graduated round brilliant diamonds set in articulated platinum mounts.', 24500.00, 3, '/images/collection-necklaces.jpg', '950 Platinum', 'Round Brilliant Diamonds', '12.50 ct', 3, 1, 1, 1),
        ('Palais Royale Emerald Cuff', 'palais-royale-emerald-cuff', 'Art Deco inspired statement cuff set with certified Colombian emeralds flanked by tapered baguette diamonds.', 16800.00, 4, '/images/collection-rings.jpg', '18K Yellow Gold', 'Colombian Emerald', '5.80 ct', 4, 1, 0, 1),
        ('Imperial Diamond Pavé Bangle', 'imperial-diamond-pave-bangle', 'A sculptured hinged bangle in 18k Rose Gold with three rows of hand-set pavé diamonds and concealed safety clasp.', 7600.00, 4, '/images/collection-rings.jpg', '18K Rose Gold', 'Pavé Diamonds', '2.80 ct', 9, 1, 1, 1),
        ('The Sovereign Ceylon Sapphire Collier', 'sovereign-ceylon-sapphire-collier', 'One-of-a-kind High Joaillerie masterpiece crowned with an untreated 8.40 ct Royal Blue Ceylon Sapphire and marquise diamonds.', 48000.00, 6, '/images/hero-bg.jpg', '950 Platinum & 18K Gold', 'Ceylon Sapphire & Marquise Diamond', '14.20 ct', 2, 1, 1, 1)
      `);
    }

    // Seed Demo Users if empty
    const [userRows] = await connection.query<any[]>("SELECT COUNT(*) as count FROM users");
    if (userRows[0].count === 0) {
      console.log("[Migration] Seeding demo user accounts...");
      const adminPass = await hashPassword("AdminSecret123");
      const customerPass = await hashPassword("Password123");

      await connection.query(`
        INSERT INTO users (name, email, password, role) VALUES
        ('Dinorah Administrator', 'admin@dinorah.com', ?, 'admin'),
        ('Maria De Luca', 'maria@example.com', ?, 'customer')
      `, [adminPass, customerPass]);
    }

    // Seed Orders & Order Items if empty
    const [orderRows] = await connection.query<any[]>("SELECT COUNT(*) as count FROM orders");
    if (orderRows[0].count === 0) {
      console.log("[Migration] Seeding demo orders and sales data for admin insights...");
      const orderInserts = [
        { status: 'delivered', total: 10250.00, date: '2025-01-02 10:15:00', items: [{ prodId: 1, qty: 1, price: 6800.00 }, { prodId: 2, qty: 1, price: 3450.00 }] },
        { status: 'delivered', total: 8900.00, date: '2025-01-05 14:22:00', items: [{ prodId: 3, qty: 1, price: 8900.00 }] },
        { status: 'delivered', total: 7150.00, date: '2025-01-10 11:00:00', items: [{ prodId: 4, qty: 1, price: 4200.00 }, { prodId: 5, qty: 1, price: 2950.00 }] },
        { status: 'delivered', total: 24500.00, date: '2025-01-15 16:45:00', items: [{ prodId: 6, qty: 1, price: 24500.00 }] },
        { status: 'delivered', total: 16800.00, date: '2025-01-18 09:30:00', items: [{ prodId: 7, qty: 1, price: 16800.00 }] },
        { status: 'delivered', total: 7600.00, date: '2025-01-22 13:10:00', items: [{ prodId: 8, qty: 1, price: 7600.00 }] },
        { status: 'delivered', total: 13600.00, date: '2025-01-25 15:20:00', items: [{ prodId: 1, qty: 2, price: 6800.00 }] },
        { status: 'shipped', total: 6900.00, date: '2025-01-28 17:00:00', items: [{ prodId: 2, qty: 2, price: 3450.00 }] },
        { status: 'shipped', total: 8900.00, date: '2025-02-01 10:05:00', items: [{ prodId: 3, qty: 1, price: 8900.00 }] },
        { status: 'confirmed', total: 4200.00, date: '2025-02-05 12:40:00', items: [{ prodId: 4, qty: 1, price: 4200.00 }] },
        { status: 'confirmed', total: 2950.00, date: '2025-02-08 14:15:00', items: [{ prodId: 5, qty: 1, price: 2950.00 }] },
        { status: 'confirmed', total: 48000.00, date: '2025-02-12 11:30:00', items: [{ prodId: 9, qty: 1, price: 48000.00 }] },
        { status: 'pending', total: 6800.00, date: '2025-02-16 16:50:00', items: [{ prodId: 1, qty: 1, price: 6800.00 }] },
        { status: 'pending', total: 15200.00, date: '2025-02-20 18:00:00', items: [{ prodId: 8, qty: 2, price: 7600.00 }] },
        { status: 'cancelled', total: 3450.00, date: '2025-02-22 08:30:00', items: [{ prodId: 2, qty: 1, price: 3450.00 }] },
      ];

      for (const ord of orderInserts) {
        const [res] = await connection.query<any>(
          "INSERT INTO orders (user_id, status, total_amount, created_at, updated_at) VALUES (2, ?, ?, ?, ?)",
          [ord.status, ord.total, ord.date, ord.date]
        );
        const orderId = res.insertId;
        for (const item of ord.items) {
          await connection.query(
            "INSERT INTO order_items (order_id, product_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?)",
            [orderId, item.prodId, item.qty, item.price, ord.date]
          );
        }
      }
    }

    // Seed recent active visitor sessions if empty
    const [actRows] = await connection.query<any[]>("SELECT COUNT(*) as count FROM user_activity");
    if (actRows[0].count === 0) {
      console.log("[Migration] Seeding initial active visitor sessions...");
      const now = new Date();
      const m1Ago = new Date(now.getTime() - 1 * 60 * 1000);
      const m2Ago = new Date(now.getTime() - 2 * 60 * 1000);
      const m3Ago = new Date(now.getTime() - 3 * 60 * 1000);
      const m4Ago = new Date(now.getTime() - 4 * 60 * 1000);

      await connection.query(`
        INSERT INTO user_activity (session_id, user_id, current_page, product_id, activity_type, last_activity_at) VALUES
        ('sess_client_891', 2, '/products', 1, 'product_view', ?),
        ('sess_guest_302', NULL, '/products', 3, 'product_view', ?),
        ('sess_guest_449', NULL, '/products', 1, 'product_view', ?),
        ('sess_guest_772', NULL, '/products', NULL, 'page_view', ?),
        ('sess_client_105', 1, '/admin', NULL, 'page_view', ?)
      `, [m1Ago, m2Ago, m3Ago, m4Ago, now]);
    }

    console.log("[Migration] Migration completed successfully.");
  } catch (error) {
    console.error("[Migration] Migration error:", error);
    throw error;
  } finally {
    connection.release();
  }
}
