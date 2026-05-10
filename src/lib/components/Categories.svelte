
<script lang="ts">
  import categoriesData from '../../../data/categories.json';

  // Extract categories from the JSON data
  const categories = Object.entries(categoriesData.categories).map(([key, category]) => ({
    name: category.name,
    icon: category.icon,
    description: category.description,
    count: Object.values(category.subcategories).reduce((acc, subcat) => acc + subcat.tools.length, 0)
  }));

  function handleCategoryClick(category) {
    window.location.href = `/category/${category.name.toLowerCase()}`;
  }
</script>

<section class="py-20 bg-slate-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
        Explore <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">Categories</span>
      </h2>
      <p class="text-lg text-slate-500">
        Browse apps by category to find exactly what you need
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each categories as category}
        <button
          class="flex flex-col text-left bg-white rounded-2xl p-6 border-2 border-transparent hover:border-emerald-400 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          on:click={() => handleCategoryClick(category)}
        >
          <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform">
            {category.icon}
          </div>
          
          <h3 class="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{category.name}</h3>
          <p class="text-slate-500 line-clamp-2 mb-6 flex-1">{category.description}</p>
          
          <div class="flex items-center justify-between w-full mt-auto">
            <span class="text-sm font-semibold text-slate-400"><span class="text-emerald-600">{category.count}</span> tools</span>
            <span class="text-emerald-500 font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">Explore →</span>
          </div>
        </button>
      {/each}
    </div>
  </div>
</section>