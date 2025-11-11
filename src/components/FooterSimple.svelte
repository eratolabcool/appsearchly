<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-section">
        <h4>App Search</h4>
        <p>Discover the best apps across all platforms</p>
      </div>

      <div class="footer-section">
        <h4>Features</h4>
        <ul>
          <li><a href="#search">App Search</a></li>
          <li><a href="#compare">Compare Apps</a></li>
          <li><a href="#trending">Trending Apps</a></li>
          <li><a href="#alternatives">Alternatives</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Platforms</h4>
        <ul>
          <li><a href="#ios">iOS Apps</a></li>
          <li><a href="#android">Android Apps</a></li>
          <li><a href="#web">Web Apps</a></li>
          <li><a href="#desktop">Desktop Apps</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Analytics</h4>
        <ul>
          <li><a href="#analytics">Dashboard</a></li>
          <li><a href="#stats">Statistics</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Support</h4>
        <ul>
          <li><a href="#help">Help Center</a></li>
          <li><a href="#contact">Contact Us</a></li>
          <li><a href="#privacy">Privacy Policy</a></li>
          <li><a href="#terms">Terms of Service</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {currentYear} App Search. All rights reserved.</p>
      <p>Made with ❤️ for app discovery</p>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: #1d1d1f;
    color: #f5f5f7;
    padding: 40px 0 20px;
    margin-top: 60px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-section h4 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: #f5f5f7;
  }

  .footer-section p {
    font-size: 14px;
    color: #a1a1a6;
    margin: 0;
    line-height: 1.4;
  }

  .footer-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-section li {
    margin-bottom: 8px;
  }

  .footer-section a {
    color: #a1a1a6;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s ease;
  }

  .footer-section a:hover {
    color: #007aff;
  }

  .footer-bottom {
    border-top: 1px solid #424245;
    padding-top: 20px;
    text-align: center;
  }

  .footer-bottom p {
    font-size: 12px;
    color: #86868b;
    margin: 4px 0;
  }

  @media (max-width: 768px) {
    .footer {
      padding: 30px 0 20px;
    }

    .footer-content {
      grid-template-columns: 1fr;
      gap: 30px;
      text-align: center;
    }

    .footer-section ul {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
    }

    .footer-section li {
      margin-bottom: 0;
    }
  }
</style>