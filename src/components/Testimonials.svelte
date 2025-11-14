<script lang="ts">
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

  function renderStars(rating) {
    return '⭐'.repeat(rating);
  }
</script>

<section class="testimonials-section">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">
        What Our <span class="title-highlight">Users</span> Say
      </h2>
      <p class="section-subtitle">
        Join thousands of professionals who trust Appsearchly.org
      </p>
    </div>

    <div class="testimonials-grid">
      {#each testimonials as testimonial}
        <div class="testimonial-card">
          <div class="rating">
            {renderStars(testimonial.rating)}
          </div>
          <p class="testimonial-content">"{testimonial.content}"</p>
          <div class="author">
            <div class="avatar">{testimonial.avatar}</div>
            <div class="author-info">
              <div class="author-name">{testimonial.name}</div>
              <div class="author-role">{testimonial.role}</div>
              <div class="author-company">{testimonial.company}</div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .testimonials-section {
    padding: 80px 0;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .section-header {
    text-align: center;
    margin-bottom: 60px;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 16px;
    color: var(--text-primary);
  }

  .title-highlight {
    background: var(--gradient-secondary);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .section-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
  }

  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 40px;
  }

  .testimonial-card {
    background: white;
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }

  .testimonial-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }

  .rating {
    font-size: 1.2rem;
    margin-bottom: 20px;
  }

  .testimonial-content {
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--text-primary);
    margin-bottom: 24px;
    font-style: italic;
  }

  .author {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--gradient-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
  }

  .author-info {
    flex: 1;
  }

  .author-name {
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .author-role {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 2px;
  }

  .author-company {
    color: var(--primary-color);
    font-size: 0.9rem;
    font-weight: 600;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .testimonials-section {
      padding: 60px 0;
    }

    .section-title {
      font-size: 2rem;
    }

    .testimonials-grid {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .testimonial-card {
      padding: 24px;
    }
  }
</style>