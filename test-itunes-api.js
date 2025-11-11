// Test script for iTunes Search API
const BASE_URL = 'https://itunes.apple.com/search';

async function testiTunesAPI() {
  console.log('🧪 Testing iTunes Search API...');

  try {
    // Test search for productivity apps
    console.log('📱 Searching for productivity apps...');
    const response = await fetch(`${BASE_URL}?term=productivity&country=US&media=software&entity=software&limit=5`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log('✅ iTunes API Connection successful!');
    console.log(`📊 Found ${data.resultCount} apps`);

    if (data.results && data.results.length > 0) {
      console.log('\n🔍 Sample app data:');
      const sampleApp = data.results[0];
      console.log(`- Name: ${sampleApp.trackName}`);
      console.log(`- Developer: ${sampleApp.artistName}`);
      console.log(`- Category: ${sampleApp.primaryGenreName}`);
      console.log(`- Price: $${sampleApp.price}`);
      console.log(`- Rating: ${sampleApp.averageUserRating}/5 (${sampleApp.userRatingCount} reviews)`);
      console.log(`- Icon: ${sampleApp.artworkUrl100}`);
      console.log(`- App Store URL: ${sampleApp.trackViewUrl}`);

      console.log('\n📋 Full sample data:');
      console.log(JSON.stringify(sampleApp, null, 2));
    }

    // Test another search
    console.log('\n🔍 Testing search for "Instagram"...');
    const instagramResponse = await fetch(`${BASE_URL}?term=instagram&country=US&media=software&entity=software&limit=1`);
    const instagramData = await instagramResponse.json();

    if (instagramData.results && instagramData.results.length > 0) {
      console.log('✅ Instagram search successful!');
      console.log(`- App: ${instagramData.results[0].trackName}`);
      console.log(`- Developer: ${instagramData.results[0].artistName}`);
    }

  } catch (error) {
    console.error('❌ iTunes API test failed:', error.message);
  }
}

// Run tests
testiTunesAPI();