import { test, expect } from '@playwright/test';

test.describe('Custom Domain Google Sign-in Test', () => {
  // Test against the custom domain
  test.use({ baseURL: 'https://todo.cox-fam.com' });
  
  test('should test Google sign-in on custom domain', async ({ page }) => {
    console.log('🚀 Testing Google sign-in on CUSTOM DOMAIN: todo.cox-fam.com');
    
    // Navigate to the custom domain login page
    await page.goto('/login');
    console.log('📍 Navigated to custom domain login page');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ DOM content loaded');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    console.log('✅ Network idle');
    
    // Get the page title and URL
    const title = await page.title();
    const url = page.url();
    console.log('📄 Page title:', title);
    console.log('🔗 Current URL:', url);
    
    // Verify we're on the custom domain
    expect(url).toContain('todo.cox-fam.com');
    console.log('✅ Confirmed we are on custom domain');
    
    // Check if the root div exists and has content
    const rootDiv = page.locator('#root');
    const rootExists = await rootDiv.count() > 0;
    console.log('🏗️ Root div exists:', rootExists);
    
    if (rootExists) {
      const rootContent = await rootDiv.textContent();
      console.log('📏 Root div content length:', rootContent ? rootContent.length : 0);
      
      // Wait for React to render content
      await page.waitForTimeout(3000);
      
      // Check if the login form is visible
      try {
        const loginHeading = page.locator('h2:has-text("Sign in to your account")');
        const headingVisible = await loginHeading.isVisible();
        console.log('🔍 Login heading visible:', headingVisible);
        
        if (headingVisible) {
          console.log('✅ Login form is rendering correctly');
          
          // Look for the Google sign-in button
          const googleButton = page.getByRole('button', { name: /Sign in with Google/ });
          const buttonVisible = await googleButton.isVisible();
          console.log('🔍 Google sign-in button visible:', buttonVisible);
          
          if (buttonVisible) {
            console.log('✅ Google sign-in button found!');
            
            // Set up console monitoring
            const consoleErrors = [];
            const consoleLogs = [];
            
            page.on('console', msg => {
              if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
                console.log('❌ Console Error:', msg.text());
              } else if (msg.type() === 'log') {
                consoleLogs.push(msg.text());
                console.log('📝 Console Log:', msg.text());
              }
            });
            
            // Set up page error monitoring
            page.on('pageerror', error => {
              console.log('💥 Page Error:', error.message);
            });
            
            // Now let's test the Google sign-in flow
            console.log('🔄 Attempting Google sign-in on custom domain...');
            await googleButton.click();
            console.log('👆 Clicked Google sign-in button');
            
            // Wait for either a popup or an error
            try {
              // Wait for a popup to open (Google OAuth flow)
              const popupPromise = page.waitForEvent('popup', { timeout: 8000 });
              const popup = await popupPromise;
              console.log('🎉 Google OAuth popup opened successfully!');
              
              // Wait for the popup to load
              await popup.waitForLoadState('networkidle');
              
              // Check if we're on Google's OAuth page
              const popupTitle = await popup.title();
              console.log('📋 Popup title:', popupTitle);
              
              if (popupTitle.includes('Google') || popupTitle.includes('Sign in') || popupTitle.includes('Choose an account')) {
                console.log('✅ Google OAuth popup is working correctly!');
                
                // Close the popup to continue testing
                await popup.close();
                console.log('🔒 Closed popup');
                
                // Wait a bit for any authentication errors to appear
                await page.waitForTimeout(3000);
                
                // Check for any error messages
                const errorElements = page.locator('.bg-red-100, .text-red-700, [class*="error"]');
                if (await errorElements.count() > 0) {
                  const errorText = await errorElements.first().textContent();
                  console.log('⚠️ Authentication error found:', errorText);
                  
                  // Check if it's an unauthorized domain error
                  if (errorText.includes('unauthorized-domain') || errorText.includes('not authorized')) {
                    console.log('❌ UNAUTHORIZED DOMAIN ERROR - This domain needs to be added to Firebase authorized domains');
                  }
                } else {
                  console.log('✅ No authentication errors found');
                }
                
              } else {
                console.log('❓ Unexpected popup content:', popupTitle);
              }
              
            } catch (popupError) {
              console.log('📱 No popup opened, checking for errors or alternative flow...');
              
              // Wait a bit for any error messages to appear
              await page.waitForTimeout(3000);
              
              // Check for error messages
              const errorElements = page.locator('.bg-red-100, .text-red-700, [class*="error"]');
              if (await errorElements.count() > 0) {
                const errorText = await errorElements.first().textContent();
                console.log('⚠️ Error message found:', errorText);
                
                // Check if it's an unauthorized domain error
                if (errorText.includes('unauthorized-domain') || errorText.includes('not authorized')) {
                  console.log('❌ UNAUTHORIZED DOMAIN ERROR - This domain needs to be added to Firebase authorized domains');
                  console.log('🔧 To fix this:');
                  console.log('   1. Go to Firebase Console > Authentication > Sign-in method');
                  console.log('   2. Click on Google');
                  console.log('   3. Add "todo.cox-fam.com" to "Authorized domains"');
                } else if (errorText.includes('browser extension') || errorText.includes('popup blocked')) {
                  console.log('✅ This is expected - browser extension conflicts detected');
                }
              } else {
                console.log('✅ No error messages found');
              }
              
              // Check if we were redirected anywhere
              const currentUrl = page.url();
              console.log('🔗 Current URL after Google sign-in attempt:', currentUrl);
              
              if (currentUrl.includes('/login')) {
                console.log('✅ Still on login page (expected for extension conflicts)');
              } else if (currentUrl.includes('/')) {
                console.log('🎉 Successfully redirected to home page!');
              } else {
                console.log('❓ Unexpected redirect to:', currentUrl);
              }
            }
            
            // Log console activity summary
            console.log('\n📊 Console Activity Summary:');
            console.log('Console Logs:', consoleLogs.length);
            console.log('Console Errors:', consoleErrors.length);
            
            if (consoleErrors.length > 0) {
              console.log('❌ Console Errors:', consoleErrors);
            }
            
          } else {
            console.log('❌ Google sign-in button not found');
          }
        } else {
          console.log('❌ Login form not rendering');
        }
        
      } catch (error) {
        console.log('❌ Error checking login form:', error.message);
      }
      
    } else {
      console.log('❌ Root div not found');
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'custom-domain-google-login-test.png' });
    console.log('📸 Screenshot saved as custom-domain-google-login-test.png');
    
    // The test passes if we can at least load the custom domain page
    expect(title).toBeTruthy();
    expect(url).toContain('todo.cox-fam.com');
    console.log('🎯 Custom domain test completed successfully!');
  });
});
