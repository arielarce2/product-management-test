<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;

class UserTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test user can register
     */
    public function test_user_can_register()
    {
        $userData = [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'data' => [
                        'user' => ['id', 'name', 'email'],
                        'token'
                    ]
                ]);

        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'name' => $userData['name']
        ]);
    }

    /**
     * Test user cannot register with invalid data
     */
    public function test_user_cannot_register_with_invalid_data()
    {
        $response = $this->postJson('/api/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => 'short',
            'password_confirmation' => 'different'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    /**
     * Test user cannot register with duplicate email
     */
    public function test_user_cannot_register_with_duplicate_email()
    {
        $existingUser = User::factory()->create();
        
        $response = $this->postJson('/api/register', [
            'name' => $this->faker->name,
            'email' => $existingUser->email,
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test user can login
     */
    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123')
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'data' => [
                        'user' => ['id', 'name', 'email'],
                        'token'
                    ]
                ]);
    }

    /**
     * Test user cannot login with invalid credentials
     */
    public function test_user_cannot_login_with_invalid_credentials()
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123')
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
                ->assertJson([
                    'status' => 'error',
                    'message' => 'Invalid credentials'
                ]);
    }

    /**
     * Test user cannot login with missing fields
     */
    public function test_user_cannot_login_with_missing_fields()
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email', 'password']);
    }

    /**
     * Test user can logout
     */
    public function test_user_can_logout()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/logout');

        $response->assertStatus(200)
                ->assertJson([
                    'status' => 'success',
                    'message' => 'Successfully logged out'
                ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id
        ]);
    }

    /**
     * Test user cannot logout without authentication
     */
    public function test_user_cannot_logout_without_authentication()
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    /**
     * Test user can logout and token is deleted
     */
    public function test_user_can_logout_and_token_is_deleted()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/logout');

        $response->assertStatus(200)
                ->assertJson([
                    'status' => 'success',
                    'message' => 'Successfully logged out'
                ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'auth_token'
        ]);
    }

    /**
     * Test specific validation rules for registration
     */
    public function test_register_validation_rules()
    {
        // Test name validation
        $response = $this->postJson('/api/register', [
            'name' => str_repeat('a', 256), // Too long
            'email' => 'valid@email.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ]);
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name']);

        // Test email format validation
        $response = $this->postJson('/api/register', [
            'name' => 'Valid Name',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ]);
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);

        // Test password minimum length
        $response = $this->postJson('/api/register', [
            'name' => 'Valid Name',
            'email' => 'valid@email.com',
            'password' => '123',
            'password_confirmation' => '123'
        ]);
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);

        // Test password confirmation
        $response = $this->postJson('/api/register', [
            'name' => 'Valid Name',
            'email' => 'valid@email.com',
            'password' => 'password123',
            'password_confirmation' => 'different123'
        ]);
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test password is properly hashed on registration
     */
    public function test_password_is_hashed_on_registration()
    {
        $userData = [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];

        $response = $this->postJson('/api/register', $userData);
        $response->assertStatus(201);

        $user = User::where('email', $userData['email'])->first();
        $this->assertNotEquals($userData['password'], $user->password);
        $this->assertTrue(Hash::check($userData['password'], $user->password));
    }

    /**
     * Test user cannot login with non-existent email
     */
    public function test_user_cannot_login_with_non_existent_email()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@email.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(401)
                ->assertExactJson([
                    'status' => 'error',
                    'message' => 'Invalid credentials'
                ]);
    }

    /**
     * Test exact JSON structure on successful login
     */
    public function test_login_json_structure()
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123')
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'status' => 'success',
                    'message' => 'Login successful'
                ])
                ->assertJsonStructure([
                    'status',
                    'message',
                    'data' => [
                        'user' => [
                            'id',
                            'name',
                            'email',
                            'created_at',
                            'updated_at'
                        ],
                        'token'
                    ]
                ]);
    }

    /**
     * Test logout deletes the specific token used
     */
    public function test_logout_deletes_specific_token()
    {
        $user = User::factory()->create();
        
        // Create multiple tokens
        $token1 = $user->createToken('token1')->plainTextToken;
        $token2 = $user->createToken('token2')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token1
        ])->postJson('/api/logout');

        $response->assertStatus(200);

        // Verify only the used token was deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'token1'
        ]);
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'token2'
        ]);
    }
} 