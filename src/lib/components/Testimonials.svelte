
<script lang="ts">
  import { Star } from 'lucide-svelte';

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      company: 'TechStart Inc.',
      avatar: 'SC',
      content: 'Appsearchly.org helped us find the perfect project management tools. The detailed reviews saved us hours of research time.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Freelance Designer',
      company: 'Creative Studio',
      avatar: 'MR',
      content: 'I discovered amazing design alternatives I never knew existed. The site has become my go-to resource for app recommendations.',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'Startup Founder',
      company: 'InnovateLabs',
      avatar: 'EW',
      content: 'The comprehensive app database and intelligent search features make finding the right software incredibly easy.',
      rating: 5
    }
  ];
</script>

<section class="py-20 bg-slate-50 border-t border-slate-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
        What Our <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-500">Users</span> Say
      </h2>
      <p class="text-lg text-slate-500">
        Join thousands of professionals who trust Appsearchly.org
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each testimonials as testimonial}
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300">
          <div class="flex items-center gap-1 mb-6">
            {#each Array(testimonial.rating) as _}
              <Star size={18} class="text-amber-400 fill-amber-400" />
            {/each}
          </div>
          
          <p class="text-slate-700 text-lg leading-relaxed italic mb-8">
            "{testimonial.content}"
          </p>
          
          <div class="flex items-center gap-4 mt-auto">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {testimonial.avatar}
            </div>
            <div>
              <div class="font-bold text-slate-900">{testimonial.name}</div>
              <div class="text-sm text-slate-500">{testimonial.role} <span class="text-blue-600 font-medium">@ {testimonial.company}</span></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>