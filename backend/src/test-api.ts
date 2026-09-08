async function runTestSuite() {
  const BASE_URL = "http://localhost:5001/api";
  console.log("🚀 Starting Dinorah Sprint 2 Comprehensive API Test Suite on " + BASE_URL);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, extraInfo = "") {
    totalTests++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName} ${extraInfo}`);
    }
  }

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === "ok", "1. Health check returns 200 OK");

    const randomSuffix = Date.now();
    const customerEmail = `customer_${randomSuffix}@dinorah.com`;
    const adminEmail = `admin_${randomSuffix}@dinorah.com`;
    const password = "SecurePassword123";

    // 2. User Registration (Customer)
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Maria Silva",
        email: customerEmail,
        password: password,
        role: "customer",
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.success === true && regData.user.role === "customer", "2. Customer registration succeeds with 201 Created");
    const customerToken = regData.token;

    // 3. User Registration (Admin)
    const regAdminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Dinorah Master Admin",
        email: adminEmail,
        password: password,
        role: "admin",
      }),
    });
    const regAdminData = await regAdminRes.json();
    assert(regAdminRes.status === 201 && regAdminData.user.role === "admin", "3. Admin registration succeeds with 201 Created");
    const adminToken = regAdminData.token;

    // 4. Public Categories Listing
    const catsRes = await fetch(`${BASE_URL}/categories`);
    const catsData = await catsRes.json();
    assert(catsRes.status === 200 && Array.isArray(catsData.categories) && catsData.categories.length > 0, "4. Public GET /api/categories returns category list");
    const firstCatId = catsData.categories[0].id;

    // 5. Public Products Listing & Filtering
    const prodsRes = await fetch(`${BASE_URL}/products`);
    const prodsData = await prodsRes.json();
    assert(prodsRes.status === 200 && Array.isArray(prodsData.products) && prodsData.products.length > 0, "5. Public GET /api/products returns products");
    const firstProd = prodsData.products[0];

    // 6. Public Get Single Product
    const singleProdRes = await fetch(`${BASE_URL}/products/${firstProd.id}`);
    const singleProdData = await singleProdRes.json();
    assert(singleProdRes.status === 200 && singleProdData.product.id === firstProd.id, "6. Public GET /api/products/:id returns product details");

    // 7. Non-existent Product 404
    const notFoundProdRes = await fetch(`${BASE_URL}/products/999999`);
    assert(notFoundProdRes.status === 404, "7. Non-existent product ID returns 404 Not Found");

    // 8. Customer Rejection on Admin Category Creation (403)
    const custCatCreateRes = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ name: "Tiara & Crowns" }),
    });
    assert(custCatCreateRes.status === 403, "8. Customer rejected from creating category with 403 Forbidden");

    // 9. Admin Category Creation (201)
    const newCatName = `Bridal Tiara ${randomSuffix}`;
    const adminCatCreateRes = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: newCatName,
        description: "Bespoke diamond tiaras for high galas",
        imageUrl: "/images/hero-bg.jpg",
      }),
    });
    const adminCatCreateData = await adminCatCreateRes.json();
    assert(adminCatCreateRes.status === 201 && adminCatCreateData.category.name === newCatName, "9. Admin can create category with 201 Created");
    const createdCatId = adminCatCreateData.category.id;

    // 10. Admin Category Update (200)
    const adminCatUpdateRes = await fetch(`${BASE_URL}/categories/${createdCatId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        description: "Updated description for haute tiaras",
      }),
    });
    const adminCatUpdateData = await adminCatUpdateRes.json();
    assert(adminCatUpdateRes.status === 200 && adminCatUpdateData.category.description === "Updated description for haute tiaras", "10. Admin can update category with 200 OK");

    // 11. Customer Rejection on Admin Product Creation (403)
    const custProdCreateRes = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        name: "Unauthorized Ring",
        description: "Test",
        price: 1000,
        categoryId: firstCatId,
        imageUrl: "/images/collection-rings.jpg",
      }),
    });
    assert(custProdCreateRes.status === 403, "11. Customer rejected from creating product with 403 Forbidden");

    // 12. Product Validation (Negative price or missing fields rejected with 400)
    const invalidProdRes = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: "",
        price: -500,
        categoryId: 99999,
        imageUrl: "",
      }),
    });
    assert(invalidProdRes.status === 400, "12. Invalid product payload (negative price/empty name) rejected with 400 Bad Request");

    // 13. Admin Product Creation (201)
    const newProdName = `The Royal Solitaire Diamond ${randomSuffix}`;
    const adminProdCreateRes = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: newProdName,
        description: "Spectacular certified D-flawless diamond with platinum prongs.",
        price: 18500.00,
        categoryId: createdCatId,
        imageUrl: "/images/collection-rings.jpg",
        material: "950 Platinum",
        gemstone: "D-Flawless Diamond",
        caratWeight: "3.20 ct",
        stock: 5,
        isFeatured: true,
      }),
    });
    const adminProdCreateData = await adminProdCreateRes.json();
    assert(adminProdCreateRes.status === 201 && adminProdCreateData.product.name === newProdName && adminProdCreateData.product.stock === 5, "13. Admin can create product with 201 Created and stock");
    const createdProdId = adminProdCreateData.product.id;

    // 14. Admin Product Update (200)
    const adminProdUpdateRes = await fetch(`${BASE_URL}/products/${createdProdId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        price: 19200.00,
        stock: 4,
      }),
    });
    const adminProdUpdateData = await adminProdUpdateRes.json();
    assert(adminProdUpdateRes.status === 200 && adminProdUpdateData.product.price === 19200 && adminProdUpdateData.product.stock === 4, "14. Admin can update product price and stock with 200 OK");

    // 15. Activity Tracking - Heartbeat & Product View
    const heartbeatRes = await fetch(`${BASE_URL}/activity/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: `sess_test_${randomSuffix}`,
        currentPage: `/products/${createdProdId}`,
        productId: createdProdId,
      }),
    });
    assert(heartbeatRes.status === 200, "15. User activity heartbeat recorded with 200 OK");

    // 16. Customer Rejection on Admin Insights (403)
    const custInsightsRes = await fetch(`${BASE_URL}/admin/insights/overview`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(custInsightsRes.status === 403, "16. Customer rejected from admin insights with 403 Forbidden");

    // 17. Admin Insights Overview
    const adminOverviewRes = await fetch(`${BASE_URL}/admin/insights/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminOverviewData = await adminOverviewRes.json();
    assert(
      adminOverviewRes.status === 200 &&
      typeof adminOverviewData.data.totalProducts === "number" &&
      typeof adminOverviewData.data.totalRevenue === "number" &&
      typeof adminOverviewData.data.activeUsers === "number",
      "17. GET /api/admin/insights/overview returns comprehensive summary statistics"
    );

    // 18. Admin Insights Sales Performance (daily/monthly)
    const adminSalesRes = await fetch(`${BASE_URL}/admin/insights/sales?period=monthly`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminSalesData = await adminSalesRes.json();
    assert(adminSalesRes.status === 200 && Array.isArray(adminSalesData.data), "18. GET /api/admin/insights/sales returns time-grouped revenue & orders");

    // 19. Admin Insights Order Status Distribution
    const adminOrdersRes = await fetch(`${BASE_URL}/admin/insights/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminOrdersData = await adminOrdersRes.json();
    assert(
      adminOrdersRes.status === 200 &&
      typeof adminOrdersData.data.delivered === "number" &&
      typeof adminOrdersData.data.pending === "number",
      "19. GET /api/admin/insights/orders returns status breakdown"
    );

    // 20. Admin Insights Best-Selling Products
    const adminProdSalesRes = await fetch(`${BASE_URL}/admin/insights/products`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminProdSalesData = await adminProdSalesRes.json();
    assert(adminProdSalesRes.status === 200 && Array.isArray(adminProdSalesData.data), "20. GET /api/admin/insights/products returns best-selling & product sales data");

    // 21. Admin Insights Active Users & Product Viewers
    const adminActiveUsersRes = await fetch(`${BASE_URL}/admin/insights/active-users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminActiveUsersData = await adminActiveUsersRes.json();
    assert(
      adminActiveUsersRes.status === 200 &&
      typeof adminActiveUsersData.data.activeUsers === "number" &&
      Array.isArray(adminActiveUsersData.data.users),
      "21. GET /api/admin/insights/active-users returns real-time visitor sessions"
    );

    // 22. Admin Product Deletion (200)
    const adminProdDeleteRes = await fetch(`${BASE_URL}/products/${createdProdId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminProdDeleteRes.status === 200, "22. Admin can delete product with 200 OK");

    // 23. Admin Category Deletion (200)
    const adminCatDeleteRes = await fetch(`${BASE_URL}/categories/${createdCatId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminCatDeleteRes.status === 200, "23. Admin can delete category with 200 OK");

    console.log(`\n=========================================`);
    console.log(`🎯 Sprint 2 API Test Suite Completed: ${passedTests}/${totalTests} Passed`);
    console.log(`=========================================`);
  } catch (error) {
    console.error("Test Suite execution encountered an error:", error);
  }
}

runTestSuite();
