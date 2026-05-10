
<script lang="ts">
  export let tool = null;
  export let isActive = false;

  // 模拟评价数据
  let mockReviews = [
    {
      id: 1,
      author: 'Sarah Chen',
      rating: 5,
      date: '2024-01-15',
      comment: `Excellent ${tool?.category?.toLowerCase() || 'AI'} tool! The interface is intuitive and the features are exactly what I needed for my workflow.`,
      helpful: 12
    },
    {
      id: 2,
      author: 'Michael Rodriguez',
      rating: 4,
      date: '2024-01-10',
      comment: `Great tool overall. ${tool?.appName || 'It'} has helped me significantly improve productivity. Would recommend to anyone looking for ${tool?.category?.toLowerCase() || 'AI'} solutions.`,
      helpful: 8
    },
    {
      id: 3,
      author: 'Emma Thompson',
      rating: 5,
      date: '2024-01-05',
      comment: `I've been using ${tool?.appName || 'this tool'} for a few months now and it's become an essential part of my daily routine. Highly recommended!`,
      helpful: 15
    },
    {
      id: 4,
      author: 'James Wilson',
      rating: 4,
      date: '2023-12-28',
      comment: `Solid ${tool?.category?.toLowerCase() || 'AI'} tool with good features. The learning curve was minimal and the support team is responsive.`,
      helpful: 6
    },
    {
      id: 5,
      author: 'Lisa Anderson',
      rating: 5,
      date: '2023-12-20',
      comment: `Outstanding value for the price. ${tool?.appName || 'This tool'} offers more features than I expected and works flawlessly.`,
      helpful: 10
    }
  ];

  let newReview = {
    rating: 5,
    author: '',
    comment: ''
  };

  let submittingReview = false;
  let reviewSuccess = false;

  function submitReview() {
    if (!newReview.author.trim() || !newReview.comment.trim()) {
      alert('Please fill in all fields');
      return;
    }

    submittingReview = true;

    // 模拟提交评价
    setTimeout(() => {
      const review = {
        id: mockReviews.length + 1,
        author: newReview.author,
        rating: newReview.rating,
        date: new Date().toISOString().split('T')[0],
        comment: newReview.comment,
        helpful: 0
      };

      mockReviews.unshift(review);
      newReview = { rating: 5, author: '', comment: '' };
      submittingReview = false;
      reviewSuccess = true;

      setTimeout(() => {
        reviewSuccess = false;
      }, 3000);
    }, 1000);
  }

  function formatRating(rating) {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 ? '⭐' : '');
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<div class="tool-reviews" class:active={isActive}>
  <div class="reviews-content">
    <div class="reviews-header">
      <h2>⭐ User Reviews</h2>
      <p>What real users are saying about {tool?.appName || 'this tool'}</p>
    </div>

    {#if tool}
      <!-- Overall Rating Summary -->
      <div class="rating-summary">
        <div class="overall-rating">
          <div class="rating-score">
            <span class="score-number">{tool.rating?.toFixed(1) || '4.5'}</span>
            <div class="score-stars">{formatRating(tool.rating || 4.5)}</div>
          </div>
          <div class="rating-details">
            <div class="total-reviews">
              <strong>{tool.reviewCount?.toLocaleString() || '1,234'}</strong> reviews
            </div>
            <div class="rating-breakdown">
              {#each [5, 4, 3, 2, 1] as stars}
                <div class="rating-bar">
                  <span class="rating-label">{stars} ⭐</span>
                  <div class="rating-progress">
                    <div
                      class="rating-fill"
                      style="width: {stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 5 : stars === 2 ? 3 : 2}%"
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Rating Distribution -->
        <div class="rating-stats">
          <div class="stat-item">
            <div class="stat-value">{Math.round(tool.rating * 20) || 90}%</div>
            <div class="stat-label">Positive</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{tool.reviewCount?.toLocaleString() || '1,234'}</div>
            <div class="stat-label">Total Reviews</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{tool.monthlyVisits?.toLocaleString() || '500K'}</div>
            <div class="stat-label">Monthly Users</div>
          </div>
        </div>
      </div>

      <!-- Review Form -->
      <div class="review-form">
        <h3>Write a Review</h3>
        <form on:submit|preventDefault={submitReview}>
          <div class="form-row">
            <div class="form-group">
              <label for="author">Your Name</label>
              <input
                id="author"
                type="text"
                bind:value={newReview.author}
                placeholder="Enter your name"
                required
              />
            </div>
            <div class="form-group">
              <label>Rating</label>
              <div class="rating-input">
                {#each [1, 2, 3, 4, 5] as star}
                  <button
                    type="button"
                    class="rating-star {star <= newReview.rating ? 'active' : ''}"
                    on:click={() => newReview.rating = star}
                  >
                    ⭐
                  </button>
                {/each}
              </div>
            </div>
          </div>
          <div class="form-group">
            <label for="comment">Your Review</label>
            <textarea
              id="comment"
              bind:value={newReview.comment}
              placeholder="Share your experience with this tool..."
              rows="4"
              required
            ></textarea>
          </div>
          <button type="submit" class="submit-button" disabled={submittingReview}>
            {#if submittingReview}
              Submitting...
            {:else}
              Submit Review
            {/if}
          </button>
        </form>
        {#if reviewSuccess}
          <div class="success-message">
            ✓ Review submitted successfully! Thank you for your feedback.
          </div>
        {/if}
      </div>

      <!-- Reviews List -->
      <div class="reviews-list">
        <h3>Recent Reviews</h3>
        <div class="reviews-container">
          {#each mockReviews as review}
            <div class="review-card">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="reviewer-avatar">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <div class="reviewer-details">
                    <div class="reviewer-name">{review.author}</div>
                    <div class="review-date">{formatDate(review.date)}</div>
                  </div>
                </div>
                <div class="review-rating">
                  {formatRating(review.rating)}
                </div>
              </div>
              <div class="review-content">
                <p>{review.comment}</p>
              </div>
              <div class="review-actions">
                <button class="helpful-button">
                  👍 Helpful ({review.helpful})
                </button>
                <button class="report-button">
                  Report
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="no-reviews">
        <div class="no-reviews-icon">⭐</div>
        <h3>Reviews Coming Soon</h3>
        <p>User reviews will be available shortly</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .tool-reviews {
    background: white;
    border-radius: 16px;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }

  .tool-reviews.active {
    transform: translateY(0);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .reviews-content {
    padding: 40px;
  }

  .reviews-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .reviews-header h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .reviews-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .rating-summary {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
    background: var(--light-bg);
    border-radius: 16px;
    padding: 40px;
    margin-bottom: 40px;
  }

  .overall-rating {
    display: flex;
    align-items: center;
    gap: 30px;
  }

  .rating-score {
    text-align: center;
  }

  .score-number {
    font-size: 3.5rem;
    font-weight: 800;
    color: var(--primary-color);
    display: block;
    line-height: 1;
  }

  .score-stars {
    font-size: 1.5rem;
    margin-top: 8px;
  }

  .rating-details {
    flex: 1;
  }

  .total-reviews {
    font-size: 1.1rem;
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .rating-breakdown {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rating-bar {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .rating-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    width: 40px;
    text-align: right;
  }

  .rating-progress {
    flex: 1;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .rating-fill {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .rating-stats {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .stat-item {
    text-align: center;
    padding: 16px;
    background: white;
    border-radius: 12px;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .review-form {
    background: var(--light-bg);
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 40px;
  }

  .review-form h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 24px;
    text-align: center;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .form-group input,
  .form-group textarea {
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
  }

  .rating-input {
    display: flex;
    gap: 8px;
  }

  .rating-star {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.3;
    transition: all 0.2s ease;
    padding: 4px;
  }

  .rating-star:hover,
  .rating-star.active {
    opacity: 1;
    transform: scale(1.1);
  }

  .submit-button {
    padding: 14px 28px;
    background: var(--gradient-primary);
    color: white;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
  }

  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .success-message {
    margin-top: 16px;
    padding: 12px;
    background: #10b981;
    color: white;
    border-radius: 8px;
    text-align: center;
    font-weight: 500;
  }

  .reviews-list h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 24px;
  }

  .reviews-container {
    display: grid;
    gap: 24px;
  }

  .review-card {
    background: var(--light-bg);
    border-radius: 12px;
    padding: 24px;
    transition: all 0.3s ease;
  }

  .review-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .reviewer-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .reviewer-avatar {
    width: 40px;
    height: 40px;
    background: var(--gradient-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .reviewer-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .review-date {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .review-rating {
    font-size: 1.1rem;
  }

  .review-content {
    margin-bottom: 16px;
  }

  .review-content p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  .review-actions {
    display: flex;
    gap: 16px;
  }

  .helpful-button,
  .report-button {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .helpful-button:hover,
  .report-button:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
  }

  .no-reviews {
    text-align: center;
    padding: 60px;
    color: var(--text-secondary);
  }

  .no-reviews-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.3;
  }

  .no-reviews h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  @media (max-width: 768px) {
    .reviews-content {
      padding: 30px 20px;
    }

    .rating-summary {
      grid-template-columns: 1fr;
      gap: 30px;
      padding: 30px 20px;
    }

    .overall-rating {
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .review-form {
      padding: 20px;
    }
  }

  @media (max-width: 480px) {
    .score-number {
      font-size: 2.5rem;
    }

    .reviewer-info {
      flex-direction: column;
      align-items: start;
      gap: 8px;
    }

    .review-actions {
      flex-direction: column;
      gap: 8px;
    }
  }
</style>