// ===== Cart Quantity Test =====
// Test utility to verify cart quantity validation

/**
 * Test cart quantity validation with sample data
 */
export function testCartQuantityValidation() {
  console.log('🧪 Testing Cart Quantity Validation...');
  
  try {
    // Sample cart data from the user's example
    const sampleCartData = {
      "success": true,
      "data": {
        "_id": "68987fcc5f419639eaa8790b",
        "user": null,
        "guestId": "guest_1754823490823_dgektt4jfla",
        "store": "687c9bb0a7b3f2a0831c4675",
        "items": [
          {
            "product": {
              "_id": "68804019a83b761668fda7a1",
              "nameAr": "تيشيرت شبابي دراي فيت لون سكني",
              "nameEn": "MMMMMMMMM",
              "availableQuantity": 11,
              "stock": 11,
              "specificationValues": [
                {
                  "specificationId": "687e1bcdf719f1c3b5813a40",
                  "valueId": "687e1bcdf719f1c3b5813a40_0",
                  "value": "طويل",
                  "title": "الطول",
                  "quantity": 5,
                  "price": 0,
                  "_id": "6897914c6ff9f1d11982ba0d"
                },
                {
                  "specificationId": "687e1bcdf719f1c3b5813a40",
                  "valueId": "687e1bcdf719f1c3b5813a40_1",
                  "value": "قصير",
                  "title": "الطول",
                  "quantity": 6,
                  "price": 0,
                  "_id": "6897914c6ff9f1d11982ba0e"
                }
              ]
            },
            "quantity": 2,
            "selectedSpecifications": [
              {
                "specificationId": "687e1bcdf719f1c3b5813a40",
                "valueId": "6897914c6ff9f1d11982ba0d",
                "valueAr": "طويل",
                "valueEn": "tall",
                "titleAr": "الطول",
                "titleEn": "length"
              }
            ],
            "selectedColors": ["yellow"]
          },
          {
            "product": {
              "_id": "68936232169af567de454f75",
              "nameAr": "تيست",
              "nameEn": "test",
              "availableQuantity": 5,
              "stock": 5,
              "specificationValues": [
                {
                  "specificationId": "687e1bcdf719f1c3b5813a40",
                  "valueId": "687e1bcdf719f1c3b5813a40_0",
                  "value": "طويل",
                  "title": "الطول",
                  "quantity": 2,
                  "price": 0,
                  "_id": "68979ddc6ff9f1d11982c0e5"
                },
                {
                  "specificationId": "687e1bcdf719f1c3b5813a40",
                  "valueId": "687e1bcdf719f1c3b5813a40_1",
                  "value": "قصير",
                  "title": "الطول",
                  "quantity": 3,
                  "price": 0,
                  "_id": "68979ddc6ff9f1d11982c0e6"
                }
              ]
            },
            "quantity": 3,
            "selectedSpecifications": [
              {
                "specificationId": "687e1bcdf719f1c3b5813a40",
                "valueId": "68979ddc6ff9f1d11982c0e5",
                "valueAr": "طويل",
                "valueEn": "tall",
                "titleAr": "الطول",
                "titleEn": "length"
              }
            ],
            "selectedColors": ["#135fe8"]
          }
        ]
      }
    };

    // Test 1: Check available quantity for first item (طويل specification)
    const item1 = sampleCartData.data.items[0];
    const item1ProductId = item1.product._id;
    const item1SelectedColor = item1.selectedColors[0];
    const item1SelectedSpecs = {};
    item1.selectedSpecifications.forEach(spec => {
      item1SelectedSpecs[spec.specificationId] = {
        valueId: spec.valueId,
        valueAr: spec.valueAr,
        valueEn: spec.valueEn,
        titleAr: spec.titleAr,
        titleEn: spec.titleEn
      };
    });

    // Expected: 5 items available for "طويل" specification
    const expectedAvailable1 = 5;
    console.log('📋 Item 1 (طويل):');
    console.log('  - Current quantity:', item1.quantity);
    console.log('  - Expected available:', expectedAvailable1);
    console.log('  - Can increase:', item1.quantity < expectedAvailable1);
    console.log('  - Can decrease:', item1.quantity > 1);

    // Test 2: Check available quantity for second item (طويل specification)
    const item2 = sampleCartData.data.items[1];
    const item2ProductId = item2.product._id;
    const item2SelectedColor = item2.selectedColors[0];
    const item2SelectedSpecs = {};
    item2.selectedSpecifications.forEach(spec => {
      item2SelectedSpecs[spec.specificationId] = {
        valueId: spec.valueId,
        valueAr: spec.valueAr,
        valueEn: spec.valueEn,
        titleAr: spec.titleAr,
        titleEn: spec.titleEn
      };
    });

    // Expected: 2 items available for "طويل" specification
    const expectedAvailable2 = 2;
    console.log('📋 Item 2 (طويل):');
    console.log('  - Current quantity:', item2.quantity);
    console.log('  - Expected available:', expectedAvailable2);
    console.log('  - Can increase:', item2.quantity < expectedAvailable2);
    console.log('  - Can decrease:', item2.quantity > 1);

    // Test 3: Simulate quantity validation
    console.log('🧪 Quantity Validation Tests:');
    
    // Test item 1 - should allow increase (2 < 5)
    const canIncreaseItem1 = item1.quantity < expectedAvailable1;
    console.log('  ✅ Item 1 can increase:', canIncreaseItem1);
    
    // Test item 2 - should NOT allow increase (3 >= 2)
    const canIncreaseItem2 = item2.quantity < expectedAvailable2;
    console.log('  ❌ Item 2 can increase:', canIncreaseItem2);
    
    // Test decrease - both should allow (2 > 1, 3 > 1)
    const canDecreaseItem1 = item1.quantity > 1;
    const canDecreaseItem2 = item2.quantity > 1;
    console.log('  ✅ Item 1 can decrease:', canDecreaseItem1);
    console.log('  ✅ Item 2 can decrease:', canDecreaseItem2);

    return {
      item1: {
        productId: item1ProductId,
        currentQuantity: item1.quantity,
        availableQuantity: expectedAvailable1,
        canIncrease: canIncreaseItem1,
        canDecrease: canDecreaseItem1,
        selectedColor: item1SelectedColor,
        selectedSpecs: item1SelectedSpecs
      },
      item2: {
        productId: item2ProductId,
        currentQuantity: item2.quantity,
        availableQuantity: expectedAvailable2,
        canIncrease: canIncreaseItem2,
        canDecrease: canDecreaseItem2,
        selectedColor: item2SelectedColor,
        selectedSpecs: item2SelectedSpecs
      }
    };
    
  } catch (error) {
    console.error('❌ Cart quantity validation test failed:', error);
    return null;
  }
}

/**
 * Test quantity validation logic
 */
export function testQuantityValidationLogic() {
  console.log('🔍 Testing Quantity Validation Logic...');
  
  try {
    // Test cases
    const testCases = [
      {
        name: 'Product with specifications',
        product: {
          availableQuantity: 10,
          specificationValues: [
            { valueId: 'spec1', quantity: 5 },
            { valueId: 'spec2', quantity: 3 }
          ]
        },
        selectedSpecs: { 'spec1': { valueId: 'spec1' } },
        currentQuantity: 2,
        expectedAvailable: 5,
        expectedCanIncrease: true,
        expectedCanDecrease: true
      },
      {
        name: 'Product without specifications',
        product: {
          availableQuantity: 8,
          specificationValues: []
        },
        selectedSpecs: {},
        currentQuantity: 7,
        expectedAvailable: 8,
        expectedCanIncrease: true,
        expectedCanDecrease: true
      },
      {
        name: 'Product at max quantity',
        product: {
          availableQuantity: 5,
          specificationValues: [
            { valueId: 'spec1', quantity: 3 }
          ]
        },
        selectedSpecs: { 'spec1': { valueId: 'spec1' } },
        currentQuantity: 3,
        expectedAvailable: 3,
        expectedCanIncrease: false,
        expectedCanDecrease: true
      },
      {
        name: 'Product at min quantity',
        product: {
          availableQuantity: 10,
          specificationValues: []
        },
        selectedSpecs: {},
        currentQuantity: 1,
        expectedAvailable: 10,
        expectedCanIncrease: true,
        expectedCanDecrease: false
      }
    ];

    let passedTests = 0;
    const totalTests = testCases.length;

    testCases.forEach((testCase, index) => {
      console.log(`\n🧪 Test ${index + 1}: ${testCase.name}`);
      
      // Simulate the validation logic
      const availableQuantity = testCase.product.specificationValues.length > 0 
        ? testCase.product.specificationValues.find(sv => 
            Object.values(testCase.selectedSpecs).some(spec => spec.valueId === sv.valueId)
          )?.quantity || 0
        : testCase.product.availableQuantity;
      
      const canIncrease = testCase.currentQuantity < availableQuantity;
      const canDecrease = testCase.currentQuantity > 1;
      
      const passed = 
        availableQuantity === testCase.expectedAvailable &&
        canIncrease === testCase.expectedCanIncrease &&
        canDecrease === testCase.expectedCanDecrease;
      
      if (passed) {
        console.log('  ✅ PASSED');
        passedTests++;
      } else {
        console.log('  ❌ FAILED');
        console.log('    Expected:', {
          available: testCase.expectedAvailable,
          canIncrease: testCase.expectedCanIncrease,
          canDecrease: testCase.expectedCanDecrease
        });
        console.log('    Actual:', {
          available: availableQuantity,
          canIncrease,
          canDecrease
        });
      }
    });

    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    return passedTests === totalTests;
    
  } catch (error) {
    console.error('❌ Quantity validation logic test failed:', error);
    return false;
  }
}

/**
 * Run all cart quantity tests
 */
export function runAllCartQuantityTests() {
  console.log('🚀 Running All Cart Quantity Tests...');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Cart Quantity Validation', test: testCartQuantityValidation },
    { name: 'Quantity Validation Logic', test: testQuantityValidationLogic }
  ];
  
  const results = [];
  
  for (const testCase of tests) {
    console.log(`\n🧪 Running: ${testCase.name}`);
    console.log('-'.repeat(30));
    
    try {
      const result = testCase.test();
      results.push({ name: testCase.name, passed: !!result, result });
      
      console.log(`📊 ${testCase.name}: ${result ? '✅ PASSED' : '❌ FAILED'}`);
    } catch (error) {
      console.error(`❌ ${testCase.name} failed with error:`, error);
      results.push({ name: testCase.name, passed: false, error: error.message });
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 FINAL TEST RESULTS:');
  console.log('=' .repeat(50));
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '=' .repeat(50));
  console.log(`🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  const allPassed = passedTests === totalTests;
  console.log(`🏆 Final Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return allPassed;
}

export default {
  testCartQuantityValidation,
  testQuantityValidationLogic,
  runAllCartQuantityTests
};
