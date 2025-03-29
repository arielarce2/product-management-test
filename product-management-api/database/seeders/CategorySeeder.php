<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Initial category data
        $categories = [
            [
                'name' => 'Electronics'
            ],
            [
                'name' => 'Clothing'
            ],
            [
                'name' => 'Books'
            ]
        ];

        // Create categories
        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
