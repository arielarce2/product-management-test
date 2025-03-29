<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Initial product data
        $products = [
            [
                'name' => 'Smartphone',
                'category_id' => 1
            ],
            [
                'name' => 'Laptop',
                'category_id' => 1
            ],
            [
                'name' => 'T-shirt',
                'category_id' => 2
            ],
            [
                'name' => 'Jeans',
                'category_id' => 2
            ],
            [
                'name' => 'Book',
                'category_id' => 3
            ]
        ];

        // Create products
        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
