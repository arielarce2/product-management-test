<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Create and authenticate user
        $user = User::factory()->create();
        $this->token = $user->createToken('test-token')->plainTextToken;
    }

    /**
     * Test can list products
     */
    public function test_can_list_products()
    {
        $products = Product::factory(3)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/products');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => ['id', 'name', 'category_id']
                    ]
                ]);
    }

    /**
     * Test can create product
     */
    public function test_can_create_product()
    {
        $category = Category::factory()->create();
        $productData = [
            'name' => $this->faker->unique()->word(),
            'category_id' => $category->id
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/products', $productData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'id', 'name', 'category_id'
                ]);
    }

    /**
     * Test cannot create product with duplicate name
     */
    public function test_cannot_create_product_with_duplicate_name()
    {
        $existingProduct = Product::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/products', [
            'name' => $existingProduct->name,
            'category_id' => Category::factory()->create()->id
        ]);

        $response->assertStatus(422)
                ->assertJson([
                    'message' => ['The name has already been taken.']
                ]);
    }

    /**
     * Test can update product
     */
    public function test_can_update_product()
    {
        $product = Product::factory()->create();
        $updateData = [
            'name' => $this->faker->unique()->word(),
            'category_id' => Category::factory()->create()->id
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson("/api/products/{$product->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'id', 'name', 'category_id'
                ]);
    }

    /**
     * Test cannot update product with duplicate name
     */
    public function test_cannot_update_product_with_duplicate_name()
    {
        $product1 = Product::factory()->create();
        $product2 = Product::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson("/api/products/{$product1->id}", [
            'name' => $product2->name,
            'category_id' => Category::factory()->create()->id
        ]);

        $response->assertStatus(422)
                ->assertJson([
                    'message' => ['The name has already been taken.']
                ]);
    }

    /**
     * Test can delete product
     */
    public function test_can_delete_product()
    {
        $product = Product::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted($product);
    }

    /**
     * Test unauthenticated user cannot access products
     */
    public function test_unauthenticated_user_cannot_access_products()
    {
        $response = $this->getJson('/api/products');
        $response->assertStatus(401);
    }
}
