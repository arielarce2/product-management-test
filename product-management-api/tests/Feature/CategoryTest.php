<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private $user;
    private $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create and authenticate user
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    /**
     * Test can list categories
     */
    public function test_can_list_categories()
    {
        $categories = Category::factory(3)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/categories');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    '*' => ['id', 'name']
                ]);
    }

    /**
     * Test can create category
     */
    public function test_can_create_category()
    {
        $categoryData = [
            'name' => $this->faker->unique()->word()
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/categories', $categoryData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'id', 'name'
                ]);

        $this->assertDatabaseHas('categories', [
            'name' => $categoryData['name']
        ]);
    }

    /**
     * Test cannot create category with duplicate name
     */
    public function test_cannot_create_category_with_duplicate_name()
    {
        $existingCategory = Category::factory()->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/categories', [
            'name' => $existingCategory->name
        ]);

        $response->assertStatus(422)
                ->assertJson([
                    'message' => ['The name has already been taken.']
                ]);
    }

    /**
     * Test can update category
     */
    public function test_can_update_category()
    {
        $category = Category::factory()->create();
        
        $updateData = [
            'name' => $this->faker->unique()->word()
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson("/api/categories/{$category->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'id', 'name'
                ]);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => $updateData['name']
        ]);
    }

    /**
     * Test cannot update category with duplicate name
     */
    public function test_cannot_update_category_with_duplicate_name()
    {
        $category1 = Category::factory()->create();
        $category2 = Category::factory()->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson("/api/categories/{$category1->id}", [
            'name' => $category2->name
        ]);

        $response->assertStatus(422)
                ->assertJson([
                    'message' => ['The name has already been taken.']
                ]);
    }

    /**
     * Test can delete category without products
     */
    public function test_can_delete_category_without_products()
    {
        $category = Category::factory()->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted($category);
    }

    /**
     * Test cannot delete category with products
     */
    public function test_cannot_delete_category_with_products()
    {
        $category = Category::factory()->create();
        Product::factory()->create(['category_id' => $category->id]);
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(422)
                ->assertJson([
                    'message' => 'Cannot delete category as it has assigned products.'
                ]);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'deleted_at' => null
        ]);
    }

    /**
     * Test unauthenticated user cannot access categories
     */
    public function test_unauthenticated_user_cannot_access_categories()
    {
        $response = $this->getJson('/api/categories');
        
        $response->assertStatus(401);
    }
}
