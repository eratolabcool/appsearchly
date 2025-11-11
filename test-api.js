// Test script for RapidAPI integration
const API_KEY = '910dd82dbbmshc2168878d5df54ep100aa6jsn803c1720391b';
const BASE_URL = 'https://app-store-scraper.p.rapidapi.com';

async function testAPI() {
  console.log('🧪 Testing RapidAPI connection...');

  try {
    // Test search for productivity apps
    console.log('📱 Searching for productivity apps...');
    const response = await fetch(`${BASE_URL}/search/term=productivity`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'app-store-scraper.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log('✅ API Connection successful!');
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

      console.log('\n📋 Full sample data:');
      console.log(JSON.stringify(sampleApp, null, 2));
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Test search for popular apps
async function testPopularApps() {
  console.log('\n🔥 Testing popular apps search...');

  try {
    const queries = ['productivity', 'games', 'photo'];

    for (const query of queries) {
      console.log(`\n📱 Searching for: ${query}`);
      const response = await fetch(`${BASE_URL}/search/term=${query}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'app-store-scraper.p.rapidapi.com'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Found ${data.resultCount} apps for ${query}`);

        if (data.results && data.results.length > 0) {
          console.log(`  Top result: ${data.results[0].trackName}`);
        }
      } else {
        console.log(`❌ Failed to search for ${query}: ${response.status}`);
      }
    }

  } catch (error) {
    console.error('❌ Popular apps test failed:', error.message);
  }
}

// Run tests
testAPI().then(() => {
  testPopularApps();
});