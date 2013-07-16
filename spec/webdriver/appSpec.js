var wd = require('selenium-webdriver');
var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var appServer = require('../../app.js');

var server = new SeleniumServer({
  jar: '/usr/local/bin/selenium-server-standalone-2.33.0.jar',
  port: 4444
});
server.start();

var driver = new wd.Builder()
  .usingServer(server.address())
  .withCapabilities({'browserName': 'chrome'})
  .build();

describe('In main page,', function() {
  beforeEach(function() {
    var isLoaded = false;
    var LONG_TIMEOUT_FOR_SERVER = 10000;

    driver.get('http://127.0.0.1:3000/public/index.html')
      .then(function() {
        isLoaded = true;
      });
    
    waitsFor(function() {
      return isLoaded;
    }, '', LONG_TIMEOUT_FOR_SERVER);
  });
  
  describe('Start Button', function() {
    it('create field', function() {
      var fin = false;
      driver.findElement(wd.By.css('.start-button')).click()
        .then(function() {
          return driver.findElement(wd.By.css('.field')).isDisplayed();
        })
        .then(function(displayed) {
          expect(displayed).toBeTruthy();
          fin = true;
        });
  
      waitsFor(function() {
        return fin;
      });
    });
  });

  /*
   * JasmineにはafterAllがない。とりあえず暫定
   * https://github.com/pivotal/jasmine/pull/56
   */
  it('[afterAll]', function() {
    driver.quit();
    server.stop();
    appServer.quit();
  });
});
    

